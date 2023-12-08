const express = require('express');
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getDeletedBooks,
  updateBook,
  getBookById,
  deleteBook,
} = require('../controllers/bookController');
const {checkBooksExistence} = require('../utils/utils');

router.post('/', addBook);
router.get('/', getAllBooks);
router.get('/delBooks', getDeletedBooks);
router.put('/:bookId', updateBook);
router.get('/:bookId', getBookById);
router.delete('/:bookId', deleteBook);

module.exports = router;