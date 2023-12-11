// test.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
const app = require("../server"); // Import your Express app
const LocalStorage = require("node-localstorage").LocalStorage;

const localStorage = new LocalStorage("./storage");

chai.use(chaiHttp);

const server = app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

describe("Book API Endpoints", () => {
  // Test case for addBook endpoint
  describe("POST /books", () => {
    it("should add a new book", (done) => {
      chai
        .request(app)
        .post("/books")
        .send({
          title: "Test Book",
          author: "Test Author",
          genre: "Test Genre",
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("success").to.equal(true);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Book created successfully");
          expect(res.body.data).to.have.property("title").to.equal("Test Book");
          done();
        });
    });
  });

  // Test case for getAllBooks endpoint
  describe("GET /books", () => {
    it("should retrieve all books successfully", (done) => {
      chai
        .request(app)
        .get("/books")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.success).to.be.true;
          expect(res.body.message).to.equal("All Books retrieved successfully");
          expect(res.body.data).to.be.an("array");
          done();
        });
    });
  });

  describe("GET /books/delBooks", () => {
    it("should retrieve deleted books successfully", (done) => {
      chai
        .request(app)
        .get("/books/delBooks")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.success).to.be.true;
          expect(res.body.message).to.equal(
            "Deleted books retrieved successfully"
          );
          expect(res.body.data).to.be.an("array");
          done();
        });
    });
  });

  describe("PUT /books/{bookId}", () => {
    it("should update a book successfully", (done) => {
      // Assuming there is at least one book in the system
      const books = JSON.parse(localStorage.getItem("books") || "[]");

      if (books.length > 0) {
        const bookToUpdate = books[books.length - 1];
        const updatedBook = {
          title: "Updated Title",
          author: "Updated Author",
          genre: "Updated Genre",
        };

        chai
          .request(app)
          .put(`/books/${bookToUpdate.id}`)
          .send(updatedBook)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Book updated successfully");
            expect(res.body.data).to.be.an("object");
            expect(res.body.data.title).to.equal(updatedBook.title);
            expect(res.body.data.author).to.equal(updatedBook.author);
            expect(res.body.data.genre).to.equal(updatedBook.genre);
            // expect(res.body.data.id).to.equal(bookToUpdate.id);

            // Check if the book is updated in the books list
            // const updatedBooks = JSON.parse(
            //   localStorage.getItem("books") || "[]"
            // );
            // const updatedBookIndex = updatedBooks.findIndex(
            //   (book) => book.id === bookToUpdate.id
            // );
            // expect(updatedBookIndex).to.not.equal(-1);

            done();
          });
      } else {
        // If no books exist, the test is marked as pending
        // You may modify this based on your actual scenario
        this.skip();
      }
    });
  });

  describe("DELETE /books/{bookId}", () => {
    it("should delete a book successfully and move it to the recycle bin", (done) => {
      // Assuming there is at least one book in the system
      const books = JSON.parse(localStorage.getItem("books") || "[]");

      if (books.length > 0) {
        const bookToDelete = books[books.length - 1];

        chai
          .request(app)
          .delete(`/books/${bookToDelete.id}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Book deleted successfully");
            expect(res.body.data).to.be.an("object");
            expect(res.body.data.title).to.equal(bookToDelete.title);
            expect(res.body.data.author).to.equal(bookToDelete.author);
            expect(res.body.data.genre).to.equal(bookToDelete.genre);

            // Check if the book is moved to the deletedBooks list
            const deletedBooks = JSON.parse(
              localStorage.getItem("deletedBooks") || "[]"
            );
            const deletedBookIndex = deletedBooks.findIndex(
              (book) => book.id === bookToDelete.id
            );
            expect(deletedBookIndex).to.not.equal(-1);
            done();
          });
      } else {
        // If no books exist, the test is marked as pending
        // You may modify this based on your actual scenario
        this.skip();
      }
    });
    it("should handle invalid book ID and return 404", (done) => {
      const invalidBookId = "invalid-id";

      chai
        .request(app)
        .delete(`/books/${invalidBookId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.equal("Invalid Book value");
          done();
        });
    });
  });
  // Add test cases for other endpoints (updateBook, getBookById, deleteBook) similarly
});

server.close();
