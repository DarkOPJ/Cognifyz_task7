  const dialog = document.getElementById("simpleDialog");
  const closeDialog = document.getElementById("closeDialog");
  const postTitleElement = document.getElementById("postTitle");
  const deleteForm = document.getElementById("deleteForm");

  // Attach click event listeners to all "Delete" buttons
  const deleteButtons = document.querySelectorAll(".openDialog");

  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Get the post data from the button's data attributes
      const postId = button.getAttribute("data-post-id");
      const postTitle = button.getAttribute("data-post-title");

      // Populate the modal with the post data
      postTitleElement.textContent = postTitle;
      deleteForm.setAttribute("action", `/delete-post/${postId}?_method=DELETE`);

      // Open the dialog
      dialog.showModal();
      document.body.classList.add("no-scroll"); // Disable scrolling

    });
  });

  // Close dialog logic
  closeDialog.addEventListener("click", () => {
    dialog.close();
    document.body.classList.remove("no-scroll"); // Re-enable scrolling
  });

  // Close dialog with ESC key or click outside the dialog
  dialog.addEventListener("cancel", () => {
    document.body.classList.remove("no-scroll"); // Re-enable scrolling
  });
