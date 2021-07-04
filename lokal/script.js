"use strict";
let addLinkForm = document.forms.namedItem("add-link-form");
addLinkForm.addEventListener("submit", handleFormSubmit);
// let serverUrl: string = "http://localhost:8100/";
let serverUrl = "https://testgisjk.herokuapp.com/";
// getCards();
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
    console.log(response);
    console.log(responseValue);
}
// // --- Game ---
// interface Card {
//     id: string;
//     link: string;
// }
// // async function getCards(): Promise<void> {
// //     let url: string = serverUrl;
// //     url = url + "getCards/";
// //     let response: Response = await fetch(url);
// //     let responseValue: string = await response.text();
// //     console.log(response);
// //     console.log(responseValue);
// // }
//# sourceMappingURL=script.js.map