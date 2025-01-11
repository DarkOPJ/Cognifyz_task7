const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");
const searchClose = document.getElementById("searchClose");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", function () {
  searchBar.classList.toggle("open");
  searchBar.classList.toggle("invisible");
  this.setAttribute("aria-expanded", "true");
});

searchClose.addEventListener("click", function () {
  searchBar.classList.toggle("open");
  searchBar.classList.toggle("invisible");
  this.setAttribute("aria-expanded", "false");
});
