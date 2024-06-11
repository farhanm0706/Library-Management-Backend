const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");
const Book = require("../model/book.model")

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      password: hashPassword,
      role: role,
    });

    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        success: "Success",
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!user || !isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    } else {
      const token = generateToken(user);
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          token: token,
        },
      });
    }
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log("Hii from controller");
    const { username, email, password, role } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const updatedUser = {
      username: username,
      password: hashPassword
    };
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: updatedUser },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "User not exist" });
    }
    res.status(201).json({
      message: "User updated successfully. This activity will logout the application automatically. Please Login again",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        success: "Success",
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



// All users and their book records
exports.userList = async (req, res) => {
  try {
    const users = await User.find({}).populate('transactions.bookId');
    res.status(201).json({
      message: "User details fetched successfully",
      users: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Check for specific error types
    if (error.name === 'MongoNetworkError') {
      res.status(503).json({ error: 'Database connection error. Please try again later.' });
    } else if (error.name === 'CastError' || error.name === 'ValidationError') {
      res.status(400).json({ error: 'Invalid data format.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch users due to an unexpected error.' });
    }
  }
};


// Borrow a book
exports.borrowBook = async (req, res) => {
  console.log("borrow");
  const { id, favKey } = req.query;

  favKeyBoolean = JSON.parse(favKey);
  try {
    const user = await User.findOne({ email: req.user.email });
    const book = await Book.findById(id);
    // console.log("Book is",Boolean(favKey));
    if (!book) {
      return res.status(404).json({ error: 'Book not available' });
    } else if (user.borrowedBooks.includes(book._id)) {
      return res.status(400).json({ error: 'Book already borrowed' });
    } else if (user.borrowedBooks.length >= user.borrowLimit && !favKeyBoolean) {
      return res.status(401).json({ error: 'Borrow limit reached' });
    } else if (user.favoriteBooks.includes(book._id) && favKeyBoolean) {
      return res.status(403).json({ error: 'Book is there in favourates already' });
    }


    if (favKeyBoolean) {
      user.favoriteBooks.push(book);
      await user.save();
      res.json({ message: 'Book moved to favourites', user: user });
    } else {
      const istDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      borrowedDate = new Date(istDate);
      book.borrowedBy = user._id;
      user.transactions.push({
        bookId: book._id,
        borrowedDate: borrowedDate,
        returnedDate: null
      });

      // Add book to borrowedBooks and remove from favoriteBooks if present
      user.borrowedBooks.push(book._id);

      user.favoriteBooks = user.favoriteBooks.filter(bookId => !bookId.equals(id));
      await book.save();
      await user.save();
      res.json({ message: 'Book borrowed successfully', user: user });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to borrow book' });
  }
};



exports.getBorrowedBooks = async (req, res) => {
  try {
    // Find the user and populate the transactions' book details
    const user = await User.findOne({ email: req.user.email }).populate('transactions.bookId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("Transactions ", user.transactions);
    // Format the response to include book details and the borrowed date
    const borrowedBooks = user.transactions
      .filter(transaction => transaction.returnedDate === null)
      .map(transaction => {
        if (transaction && transaction.bookId) {
          return {
            bookId: transaction.bookId._id,
            bookname: transaction.bookId.bookname,
            authorname: transaction.bookId.authorname,
            imageUrl: transaction.bookId.imageUrl,
            borrowedDate: transaction.borrowedDate,
            returnedDate: transaction.returnedDate,
          };
        }
        return null; 
      }).filter(book => book !== null); // Filter out null values

    res.json(borrowedBooks);
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ error: 'Failed to fetch borrowed books' });
  }
};


// getFavoriteBooks

exports.getFavoriteBooks = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).populate('favoriteBooks');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.favoriteBooks);
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ error: 'Failed to fetch borrowed books' });
  }
};

exports.removeFavBook = async (req, res) => {
  const id = req.query.id;
  console.log(id, req.user);
  try {
    const user = await User.findOne({ email: req.user.email });
    const book = await Book.findById(id);
    console.log("Book is", book, user);
    if (!book || !user.favoriteBooks.includes(book._id)) {
      return res.status(404).json({ error: 'Book not available' });
    }
    user.favoriteBooks = user.favoriteBooks.filter(bookId => !(bookId && bookId.equals(book._id)));

    await user.save();
    res.json({ message: 'Book removed from favourites', user: user });

  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from Favorites' });
  }
};




exports.returnBook = async (req, res) => {
  const { id } = req.query;

  try {
    // Find the user by email
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the book by ID
    const book = await Book.findById(id);
    if (!book) {
      console.error('Book not found');
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if the book is borrowed by the user
    if (!book.borrowedBy || !book.borrowedBy.equals(user._id)) {
      console.error('Book not borrowed by user');
      return res.status(400).json({ error: 'Book not borrowed by user' });
    }

    // Remove the book from the borrowed list
    book.borrowedBy = null;

    // Update user's borrowedBooks
    user.borrowedBooks = user.borrowedBooks.filter(bookId => !(bookId && bookId.equals(book._id)));
    console.log("User", user);
    // Find and update the transaction
    const transaction = user.transactions.find(t => t.bookId && t.bookId.equals(book._id) && !t.returnedDate);
    if (transaction) {
      const istDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      transaction.returnedDate = new Date(istDate);
    } else {
      console.error('Transaction not found for the given book ID');
    }

    // Save changes to the book and user
    await book.save();
    await user.save();

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({ error: 'Failed to return book' });
  }
};



// admin retrieval transactions
exports.getAllUsersTransactions = async (req, res) => {
  try {
    // Find all users and populate their transactions with book details
    const users = await User.find({ role: 'user' }).populate('transactions.bookId');

    // Format the response to include user details and their filtered transactions
    const usersTransactions = users.map(user => ({
      username: user.username,
      email: user.email,
      role: user.role,
      transactions: user.transactions
        .filter(transaction => transaction.borrowedDate) // Filter transactions
        .map(transaction => ({
          bookId: transaction.bookId ? transaction.bookId._id : null,
          bookname: transaction.bookId ? transaction.bookId.bookname : 'Unknown',
          authorname: transaction.bookId ? transaction.bookId.authorname : 'Unknown',
          borrowedDate: transaction.borrowedDate,
          returnedDate: transaction.returnedDate ? transaction.returnedDate : 'Yet To'
        }))
    })).filter(user => user.transactions.length > 0); // Filter out users with no valid transactions

    // Send the response
    res.json(usersTransactions);
  } catch (error) {
    console.error('Error fetching users transactions:', error);
    res.status(500).json({ error: 'Failed to fetch users transactions' });
  }
};

//Delete all users except admin
exports.deleteUsers = async (req, res) => {
  const users = await User.deleteMany({ role: { $ne: 'admin' } });
  res.json(users);
}