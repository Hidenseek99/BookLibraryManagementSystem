const LocalStorage = require("node-localstorage").LocalStorage;

const localStorage = new LocalStorage("./storage");

const generateBookId = (genre, author) => {
  const prefix = `${genre.slice(0, 2)}${author.slice(0, 2)}`.toUpperCase();
  const allBooks = JSON.parse(localStorage.getItem("books") || "[]");
  const deletedBooks = JSON.parse(localStorage.getItem("deletedBooks") || "[]");
  const allBooksAndDeleted = [...allBooks, ...deletedBooks];

  // Extract existing IDs from both 'books' and 'deletedBooks'
  const existingIds = new Set(allBooksAndDeleted.map((book) => book.id));

  // Generate a new unique ID
  let newId;
  let attempt = 1;
  do {
    newId = `${prefix}${attempt}`;
    attempt++;
  } while (existingIds.has(newId));

  return newId;
};

// const isDuplicateBook = (newBook) => {
//   const books = JSON.parse(localStorage.getItem("books") || "[]");
//   return books.some(
//     (book) =>
//       book.title === newBook.title &&
//       book.author === newBook.author &&
//       book.genre === newBook.genre
//   );
// };

const isDuplicateBook = (newBook) => {
  const books = JSON.parse(localStorage.getItem("books") || "[]");
  const normalizeString = (str) => str.trim().toLowerCase();

  return books.some(
    (book) =>
      normalizeString(book.title) === normalizeString(newBook.title) &&
      normalizeString(book.author) === normalizeString(newBook.author) &&
      normalizeString(book.genre) === normalizeString(newBook.genre)
  );
};

module.exports = {
  generateBookId,
  isDuplicateBook,
};
