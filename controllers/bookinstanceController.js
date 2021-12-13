let BookInstance = require('../models/bookinstance');
let Book = require('../models/book');
let async = require('async');
const {body, validationResult} = require('express-validator');


exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
        if (err) {
            return next(err)
        }
        res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
    });
};

exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
        if (err) {
            return next(err);
        }
        if (bookinstance == null) {
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail', {title: 'Copy: '+ bookinstance.book.title, bookinstance: bookinstance});
    })
};

exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
    .exec(function(err, books) {
        if (err) {
            return next(err);
        }
        res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books})
    })
};

exports.bookinstance_create_post = [
    body('book', 'Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min:1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),

    (req, res, next) => {
        const errors = validationResult(req);

        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.bodydue_back
        });
        
        if (!errors.isEmpty()) {
            Book.find({}, 'title')
            .exec(function (err, books) {
                if (err) {
                    return next(err);
                }
                res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books,
                selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance});
            });
            return;
        }
        else {
            bookinstance.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(bookinstance.url);
            });
        }
    }
];

exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, results) {
        if (err) {
            return next(err)
        }
        if (results==null) {
            res.redirect('/catalog/bookinstances')
        }
        res.render('bookinstance_delete', {title: 'Delete Book Instance', bookinstance: results});
    });
};

exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .exec(function(err, results) {
        if (err) {
            return next(err);
        }
        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/catalog/bookinstances')
        })
    })
};

exports.bookinstance_update_get = function(req, res, next) {

    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        },
        books: function(callback) {
            Book.find(callback);
        },
    }, function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.bookinstance == null) {
                const error = new Error('Book instance not found!');
                error.status = 404;
                return next(error);
            }
            res.render('bookinstance_form', {title: 'Update book instance', book_list: results.books, bookinstance: results.bookinstance});
        });
};

exports.bookinstance_update_post = [

    body('book', 'Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min:1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),

    (req, res, next) => {
        const errors = validationResult(req);

        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.bodydue_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            async.parallel({
                bookinstance: function(callback) {
                    BookInstance.findById(req.params.id).populate('book').exec(callback);
                },
                books: function(callback) {
                    Book.find(callback);
                },
            }, function (err, results) {
                    if (err) {
                        return next(err);
                    }
                    if (results.bookinstance == null) {
                        const error = new Error('Book instance not found!');
                        error.status = 404;
                        return next(error);
                    }
                    res.render('bookinstance_form', {title: 'Update book instance', book_list: results.books, bookinstance: results.bookinstance,
                    errors: errors.array()});
                });
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, updatedBookInstance) {
                if (err) {
                    return next(err);
                }
                res.redirect(updatedBookInstance.url)
            })
        }
    }
]