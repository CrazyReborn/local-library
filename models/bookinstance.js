let mongoose = require('mongoose');
const {DateTime} = require('luxon');

let Schema = mongoose.Schema;

let BookInstanceSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref: 'Book', require: true},
    imprint: {type: String, require: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now()}
});

BookInstanceSchema.virtual('url').get(function () {
    return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema.virtual('due_back_formatted').get(function () {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_back_update_formatted').get(function () {
    return DateTime.fromJSDate(this.due_back).toISODate();
});

module.exports = mongoose.model('BookInstance', BookInstanceSchema);