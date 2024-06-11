const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookname: {
        type: String,
        required: true,
    },
    authorname: {
        type: String,
        required: true,
    },
    imageUrl: {
        type:String,
        required:true,
    },
    borrowedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
    },
});
const Book = mongoose.model("Book", bookSchema);
module.exports= Book;