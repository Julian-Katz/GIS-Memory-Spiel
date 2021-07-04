let addLinkForm: HTMLFormElement = document.forms.namedItem("add-link-form");
addLinkForm.addEventListener("submit", handleFormSubmit);
let serverUrl: string = "http://localhost:8100/";
// let serverUrl: string = "https://testgisjk.herokuapp.com/";

getCards();

// --- Admin ---
// Handle
async function handleFormSubmit(_event: Event): Promise<void> {
    _event.preventDefault();
    let url: string = serverUrl;
    let formData: FormData = new FormData(addLinkForm);
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    url = url + "?" + query.toString();
    let response: Response = await fetch(url);
    let responseValue: string = await response.text();
    console.log(responseValue);
    
}


// --- Game ---
interface Card {
    id: string;
    link: string;
}
async function getCards(): Promise<void> {
    let url: string = serverUrl;
    url = url + "getCards/";
    let response: Response = await fetch(url);
    let responseValue: string = await response.text();
    console.log(responseValue);
    
    
}
