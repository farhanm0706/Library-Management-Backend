
const express = require('express');
const { addBooks, bookList, editBook,getBook,deleteBook } = require("../controller/book.controller");

const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();


router.post("/addbook",authMiddleware, adminMiddleware, addBooks);
router.put('/update',authMiddleware, adminMiddleware, editBook);
router.get("/bookData",authMiddleware, adminMiddleware, getBook);
router.delete("/deletebook",authMiddleware, adminMiddleware, deleteBook)
router.get("/bookList",authMiddleware, bookList);

module.exports = router;