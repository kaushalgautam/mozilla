var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema({
    book: {type: Schema.ObjectId, ref: 'Book', required: true},
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
})


// virtual for bookInstance url
BookInstanceSchema
.virtual('url')
.get(function() {
    return '/catalog/bookInstance' + this._id;
});

// export model

module.exports = mongoose.model('BookInstance', BookInstanceSchema);