const contact_wrapper = document.querySelector(".coffee-form-wrapper");
const contact_card = document.querySelector(".coffee-form");
const btn = document.getElementById("coffee-btn");

btn.addEventListener( 'click', () => {
    contact_wrapper.classList.toggle("active");
    contact_card.classList.toggle("active");
});