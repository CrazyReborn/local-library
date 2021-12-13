let mongoose = require('mongoose');
const {DateTime} = require('luxon');

let Schema = mongoose.Schema;

let AuthorSchema = new Schema({
    first_name: {type: String, require: true, maxLength: 100},
    family_name: {type: String, require: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

AuthorSchema.virtual('name').get(function () {
    return this.first_name + ', ' + this.family_name;
});

AuthorSchema.virtual('lifespan').get(function () {
    let lifetime_string = '';
    if (this.date_of_birth) {
        lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
        lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }
    return lifetime_string;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
});

AuthorSchema.virtual('date_of_birth_update_formatted').get(function () {
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toISODate() : '';
})

AuthorSchema.virtual('date_of_death_update_formatted').get(function () {
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toISODate() : '';
})

AuthorSchema.virtual('url').get(function () {
    return '/catalog/author/' + this._id;
});



module.exports = mongoose.model('Author', AuthorSchema);