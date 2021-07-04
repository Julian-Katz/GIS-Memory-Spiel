"use strict";
let addLinkForm = document.forms.namedItem("add-link-form");
addLinkForm.addEventListener("submit", handleFormSubmit);
let serverUrl = "http://localhost:8100/";
// let serverUrl: string = "https://testgisjk.herokuapp.com/";
getCards();
// --- Admin ---
// Handle
async function handleFormSubmit(_event) {
    _event.preventDefault();
    let url = serverUrl;
    let formData = new FormData(addLinkForm);
    let query = new URLSearchParams(formData);
    url = url + "?" + query.toString();
    let response = await fetch(url);
    let responseValue = await response.text();
    console.log(responseValue);
}
async function getCards() {
    let url = serverUrl;
    url = url + "getCards/";
    let response = await fetch(url);
    let responseValue = await response.text();
    console.log(responseValue);
}
//# sourceMappingURL=script.js.map