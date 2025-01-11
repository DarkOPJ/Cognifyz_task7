// Function to sanitize input using DOMPurify
function sanitizeAndRender(input, outputElementId) {
  // Sanitize the input
  const sanitizedInput = DOMPurify.sanitize(input);

  // Render the sanitized input to the specified element
  document.getElementById(outputElementId).innerHTML = sanitizedInput;
}
