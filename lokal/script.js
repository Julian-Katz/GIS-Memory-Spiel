"use strict";
let addLinkForm = document.forms.namedItem("add-link-form");
addLinkForm.addEventListener("submit", handleFormSubmit);
// Handle
async function handleFormSubmit(_event) {
    _event.preventDefault();
    let url = "http://localhost:8100/";
    let formData = new FormData(addLinkForm);
    let query = new URLSearchParams(formData);
    url = url + "?" + query.toString();
    let response = await fetch(url);
    let responseValue = await response.text();
    console.log(responseValue);
}
//# sourceMappingURL=script.js.map