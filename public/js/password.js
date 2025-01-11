const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

togglePasswordButton.addEventListener("click", () => {
  // Toggle password visibility
  const isPasswordVisible = passwordInput.type === "password";
  passwordInput.type = isPasswordVisible ? "text" : "password";

  // Update the icon
  eyeIcon.classList.toggle("fa-eye", !isPasswordVisible); // Show "eye" when hiding password
  eyeIcon.classList.toggle("fa-eye-slash", isPasswordVisible); // Show "eye-slash" when showing password
});
