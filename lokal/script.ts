let addLinkForm: HTMLFormElement = document.forms.namedItem("add-link-form");
addLinkForm.addEventListener("submit", handleFormSubmit);

// Handle
async function handleFormSubmit(_event: Event): Promise<void> {
    _event.preventDefault();
    let url: string = "http://localhost:8100/";
    let formData: FormData = new FormData(addLinkForm);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    url = url + "?" + query.toString();
    let response: Response = await fetch(url);
    let responseValue: string = await response.text();
    console.log(responseValue);
}