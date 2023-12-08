const apiUrl = "http://localhost:3000/books";

function getAllBooks() {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.success) {
        const books = responseData.data;
        console.log(responseData.message);
        displayBooks("allBooksTable", books, true);
      } else {
        console.error(
          "Error getting available books: ",responseData.error,"-",responseData.details);
        Swal.fire("Error", responseData.error + ": "+responseData.details, "error");
      }
    });
}

function getAllDeletedBooks() {
  fetch(`${apiUrl}/delBooks`)
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.success) {
        const deletedBooks = responseData.data;
        console.log(responseData.message);
        displayBooks("deletedBooksTable", deletedBooks, false);
      } else {
        console.error(
          "Error getting deleted books: ",
          responseData.error,
          "-",
          responseData.details
        );
        Swal.fire("Error", responseData.error + ": "+responseData.details, "error");
      }
    })
    .catch((error) => {
      console.error("Error getting deleted books: ", error.message);
    });
}

function displayBooks(tableId, books, showDeleteButton) {
  const tableBody = document
    .getElementById(tableId)
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";

  books.forEach((book) => {
    const row = tableBody.insertRow();
    const idCell = row.insertCell(0);
    const titleCell = row.insertCell(1);
    const authorCell = row.insertCell(2);
    const genreCell = row.insertCell(3);

    idCell.textContent = book.id;
    titleCell.textContent = book.title;
    authorCell.textContent = book.author;
    genreCell.textContent = book.genre;

    if (showDeleteButton) {
      // Add Edit button
      const actionCellEdit = row.insertCell(4);
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "buttonGEdit";
      editButton.onclick = () => openEditModal(book);
      actionCellEdit.appendChild(editButton);

      // Add Delete button
      const actionCellDel = row.insertCell(5);
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "buttonGDel";
      deleteButton.onclick = () => deleteBook(book.id, tableId);
      actionCellDel.appendChild(deleteButton);
    }
  });
}

function deleteBook(bookId, tableId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You will only be able to recover this book by ADMIN Support!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${apiUrl}/${bookId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            console.log("Deleted Book:", result.data);
            console.log(result.message);
            // Refresh the table after deletion
            if (tableId === "allBooksTable") {
              getAllBooks();
              getAllDeletedBooks();
            } else {
              getAllDeletedBooks();
            }
            // Show success message
            Swal.fire("Deleted!", result.message, "success");
          } else {
            console.error("Failed to delete book: ", result.error);
            // Show error message
            Swal.fire("Error", result.error, "error");
          }
        });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Cancelled", "Your book is safe :)", "info");
    }
  });
}

function addBookFromTable() {
  const newTitle = document.getElementById("newTitle").value;
  const newAuthor = document.getElementById("newAuthor").value;
  const newGenre = document.getElementById("newGenre").value;

  const newBook = { title: newTitle, author: newAuthor, genre: newGenre };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newBook),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.log("Added Book:", result.data);
        console.log(result.message);
        // Clear form fields after adding a new book
        document.getElementById("newTitle").value = "";
        document.getElementById("newAuthor").value = "";
        document.getElementById("newGenre").value = "";
        // Refresh the table after adding a new book
        getAllBooks();
        getAllDeletedBooks();
        Swal.fire("Added!", result.message, "success");
      } else {
        console.error("Error adding book: ", result.error);
        Swal.fire("Error", result.error, "error");
      }
    });
}

function openEditModal(book) {
  Swal.fire({
    title: "Edit Book",
    html: `<label for="editTitle">Title:</label>
       <input id="editTitle" class="swal2-input" value="${book.title}" autofocus>
       <label for="editAuthor">Author:</label>
       <input id="editAuthor" class="swal2-input" value="${book.author}">
       <label for="editGenre">Genre:</label>
       <input id="editGenre" class="swal2-input" value="${book.genre}">`,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    cancelButtonText: "Cancel",
    focusConfirm: false,
    preConfirm: () => {
      const editTitle = Swal.getPopup().querySelector("#editTitle").value;
      const editAuthor = Swal.getPopup().querySelector("#editAuthor").value;
      const editGenre = Swal.getPopup().querySelector("#editGenre").value;
      return { editTitle, editAuthor, editGenre };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      saveEditedBook(book.id, result.value);
    }
  });
}

function saveEditedBook(bookId) {
  const editTitleInput = document.getElementById("editTitle");
  const editAuthorInput = document.getElementById("editAuthor");
  const editGenreInput = document.getElementById("editGenre");

  const updatedTitle = editTitleInput.value;
  const updatedAuthor = editAuthorInput.value;
  const updatedGenre = editGenreInput.value;

  const updatedBook = {
    title: updatedTitle,
    author: updatedAuthor,
    genre: updatedGenre,
  };

  fetch(`${apiUrl}/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedBook),
  })
    .then((response) => response.json())
    .then((result) => {
      if(result.success){
      console.log("Updated Book:", result.data);
      console.log(result.message);
      // Refresh the table after updating the book
      getAllBooks();
      getAllDeletedBooks();
      Swal.fire("Book Updated", result.message, "success");
    }else{
      console.error("Failed to update book: ",result.error);
      Swal.fire("Error",result.error, "error");
    }})
}

function showDeletedBooksTable() {
  const deletedBooksTable = document.getElementById("deletedBooksTable");
  // Fetch and display all deleted books
  getAllDeletedBooks();
  if (deletedBooksTable) {
    // Scroll to the deleted books table
    deletedBooksTable.scrollIntoView({ behavior: "smooth" });
  }
}

function scrollToAllBooks() {
  const allBooksTable = document.getElementById("allBooksTable");

  if (allBooksTable) {
    // Scroll to the all books table
    allBooksTable.scrollIntoView({ behavior: "smooth" });

    // Fetch and display all books
    getAllBooks();
  }
}
// Add this code in your existing JavaScript
function updateDateTime() {
  const dateTimeElement = document.getElementById("datetime");
  if (dateTimeElement) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    const dateTimeString = `${formattedDate} ${formattedTime}`;

    dateTimeElement.textContent = dateTimeString;
  }
}

// Call the function to update and display the date and time
updateDateTime();

// Update the date and time every second (1000 milliseconds)
setInterval(updateDateTime, 1000);
