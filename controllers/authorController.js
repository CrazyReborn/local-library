let Author = require('../models/author');
let Book = require('../models/book');
let async = require('async');
const {body, validationResult} = require('express-validator');

exports.author_list = function(req, res, next) {
    Author.find({})
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
        if (err) { 
            return next(err);
        }
        res.render('author_list', {title: 'Author List', author_list: list_authors});
    });
};

exports.author_detail = function(req, res, next) {
        async.parallel({
            author: function(callback) {
                Author.findById(req.params.id)
                  .exec(callback)
            },
            authors_books: function(callback) {
              Book.find({ 'author': req.params.id },'title summary')
              .exec(callback)
            },
        }, function(err, results) {
            if (err) { return next(err); } // Error in API usage.
            if (results.author==null) { // No results.
                var err = new Error('Author not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
        });
};

exports.author_create_get = function(req, res, next) {
    res.render('author_form', {title: 'Create Auhtor'});
};

exports.author_create_post = [
    body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters'),
    body('family_name').trim().isLength({min: 1}).escape().withMessage('Second name must be specified')
    .isAlphanumeric().withMessage('Second name has non-alphanumeric characters'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty) {
            res.render('author_forms', {title: 'Create Author', author: req.body, error: errors.array()})
            return;
        }
        else {
            let author = new Author({
                first_name: req.body.first_name,
                second_name: req.body.second_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save(function(err) {
                if (err) {
                    return next(err);
                }
                res.redirect(author.url);
            })
        }
    }
]

exports.author_delete_get = function(req, res, next) {

        async.parallel({
            author: function(callback) {
                Author.findById(req.params.id).exec(callback)
            },
            authors_books: function(callback) {
              Book.find({ 'author': req.params.id }).exec(callback)
            },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.author==null) { // No results.
                res.redirect('/catalog/authors');
            }
            // Successful, so render.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
        });
    
    };

exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback);
        },
        author_books: function(callback) {
            Book.find({'author': req.params.authorid}).exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.author_books.length > 0) {
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books});
        }
        else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/catalog/authors');
            })
        }
    });
};

exports.author_update_get = function(req, res, next) {
    Author.findById(req.params.id)
    .exec(function(err, author) {
        if (err) {
            return next(err);
        }
        res.render('author_form', {title: 'Update Author', author: author});
    })
};

exports.author_update_post = [
    body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters'),
    body('family_name').trim().isLength({min: 1}).escape().withMessage('Second name must be specified')
    .isAlphanumeric().withMessage('Second name has non-alphanumeric characters'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {
        const errors = validationResult(req);

        let author = new Author({
            first_name: req.body.first_name,
            second_name: req.body.second_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            Author.findById(req.params.id)
            .exec(function(err, author) {
                if (err) {
                return next(err);
            }
            res.render('author_form', {title: 'Update Author', author: author, errors: errors.array()});
            });
        }
        else {
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, updatedAuthor) {
                if (err) {
                    return next(err);
                }
                res.redirect(updatedAuthor.url);
            });
        }
    }
];