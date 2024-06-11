const express =require('express');
const  { register,login,userList,borrowBook ,deleteUsers,getAllUsersTransactions,returnBook,updateUser,getBorrowedBooks,getFavoriteBooks,removeFavBook } =require("../controller/user.controller");
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/userslist",authMiddleware, adminMiddleware,userList);
router.put('/updateuser',authMiddleware,updateUser);
router.get('/borrow',authMiddleware, borrowBook);
router.get('/borrowed-books', authMiddleware, getBorrowedBooks);

router.get('/favorite-books', authMiddleware, getFavoriteBooks);
router.get('/removefav', authMiddleware, removeFavBook)

router.get('/return',authMiddleware,returnBook);

router.get('/transactions',authMiddleware,adminMiddleware,getAllUsersTransactions);
router.delete('/deleteUsers',deleteUsers)

module.exports = router;