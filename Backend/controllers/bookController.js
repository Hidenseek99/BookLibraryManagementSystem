const {
    generateBookId,
    isDuplicateBook,
  } = require("../utils/utils");
  const LocalStorage = require("node-localstorage").LocalStorage;
  
  const localStorage = new LocalStorage("./storage");
  
  const addBook = (req, res) => {
    const newBook = req.body;
  
    // Validate required fields
    if (!newBook.title || !newBook.author || !newBook.genre) {
      return res
        .status(405)
        .json({ success: false, error: "Please provide title, author, and genre for the book." });
    }
  
    if (isDuplicateBook(newBook)) {
      return res.status(400).json({ success: false, error: "Book already exists" });
    }
  
    const books = JSON.parse(localStorage.getItem("books") || "[]");
    const deletedBooks = JSON.parse(localStorage.getItem("deletedBooks") || "[]");
  
    // If the book exists in deletedBooks, move it back to books
    const existingDeletedBookIndex = deletedBooks.findIndex(
      (book) =>
        book.title === newBook.title &&
        book.author === newBook.author &&
        book.genre === newBook.genre
    );
  
    if (existingDeletedBookIndex !== -1) {
      const existingDeletedBook = deletedBooks.splice(
        existingDeletedBookIndex,
        1
      )[0];
      books.push(existingDeletedBook);
      localStorage.setItem("books", JSON.stringify(books));
      localStorage.setItem("deletedBooks", JSON.stringify(deletedBooks));
      return res.status(200).json({ success: true, message: "Book already exists in recycle bin, moved from the recycle-bin to local storage", data: existingDeletedBook });
    } else {
      newBook.id = generateBookId(newBook.genre, newBook.author);
      books.push(newBook);
      localStorage.setItem("books", JSON.stringify(books));
      return res.status(201).json({ success: true, message: "Book created successfully", data: newBook });
    }
  };
  
  const getAllBooks = (req, res) => {
    try {
      const books = JSON.parse(localStorage.getItem("books") || "[]");
  
      if (books.length === 0) {
        return res.status(404).json({ success: false, error: "Books Not Found", details: "The book list is empty." });
      }
  
      res.status(200).json({ success: true, message: "All Books retrieved successfully", data: books });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
  };
  
  const getDeletedBooks = (req, res) => {
    try {
      const deletedBooks = JSON.parse(localStorage.getItem("deletedBooks") || "[]");
  
      if (deletedBooks.length === 0) {
        return res.status(404).json({ success: false, error: "Recycle bin empty", details: "The deleted book list is empty." });
      }
  
      res.status(200).json({ success: true, message: "Deleted books retrieved successfully", data: deletedBooks });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
  };
  
  const updateBook = (req, res, next) => {
    try {
      const books = JSON.parse(localStorage.getItem("books") || "[]");
      const deletedBooks = JSON.parse(
        localStorage.getItem("deletedBooks") || "[]"
      );
      const bookId = req.params.bookId;
      const updatedBook = req.body;
  
      const existingBookIndex = books.findIndex((book) => book.id === bookId);
  
      if (existingBookIndex !== -1) {
        const existingBook = books[existingBookIndex];
  
        // Check if the book exists in deletedBooks based on updated title, author, and genre
        const existsInDeleted = deletedBooks.some(
          (book) =>
            book.title === updatedBook.title &&
            book.author === updatedBook.author &&
            book.genre === updatedBook.genre
        );
  
        if (existsInDeleted) {
          return res
            .status(409)
            .json({
              success: false,
              error:
                "Cannot update book to these credentials. Said book exists in the deleted section",
            });
        }
  
        const isDuplicate = isDuplicateBook(updatedBook);
        if (isDuplicate && updatedBook.id !== existingBook.id) {
          return res.status(400).json({ success: false, error: "Book already exists" });
        }
  
        // Generate a new ID based on the updated author and genre
        const newId = generateBookId(updatedBook.genre, updatedBook.author);
  
        // Update the book with the new ID and other details
        existingBook.id = newId;
        existingBook.title = updatedBook.title;
        existingBook.author = updatedBook.author;
        existingBook.genre = updatedBook.genre;
  
        // Update the books array and save it to localStorage
        books[existingBookIndex] = existingBook;
        localStorage.setItem("books", JSON.stringify(books));
  
        return res.status(200).json({ success: true, message: "Book updated successfully", data: existingBook });
      } else {
        return res.status(404).json({ success: false, error: "Book not found" });
      }
    } catch (error) {
      next(error);
    }
  };
  
  const getBookById = (req, res) => {
    const books = JSON.parse(localStorage.getItem("books") || "[]");
    const bookId = req.params.bookId;
    const book = books.find((book) => book.id === bookId);
  
    if (book) {
      res.status(200).json({ success: true, message: "Book retrieved successfully", data: book });
    } else {
      res.status(404).json({ success: false, error: "Book not found" });
    }
  };
  
  const deleteBook = (req, res) => {
    const books = JSON.parse(localStorage.getItem("books") || "[]");
    const deletedBooks = JSON.parse(localStorage.getItem("deletedBooks") || "[]");
    const bookId = req.params.bookId;
  
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex !== -1) {
      const deletedBook = books.splice(bookIndex, 1)[0];
      deletedBooks.push(deletedBook);
      localStorage.setItem("books", JSON.stringify(books));
      localStorage.setItem("deletedBooks", JSON.stringify(deletedBooks));
      res.status(200).json({ success: true, message: "Book deleted successfully", data: deletedBook });
    } else {
      res.status(404).json({ success: false, error: "Invalid Book value" });
    }
  };
  
  module.exports = {
    addBook,
    getAllBooks,
    getDeletedBooks,
    updateBook,
    getBookById,
    deleteBook,
  };