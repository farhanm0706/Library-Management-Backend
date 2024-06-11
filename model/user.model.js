const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    transactions: [
        {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book'
            },
            borrowedDate: Date,
            returnedDate: Date,
        },
    ],
    borrowedBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    favoriteBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    borrowLimit: {
        type: Number,
        default: 3
    },
});
const User = mongoose.model("User", userSchema);
module.exports = User;

