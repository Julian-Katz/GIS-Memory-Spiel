namespace script {
    let serverUrl: string = "http://localhost:8100/";
    // let serverUrl: string = "https://testgisjk.herokuapp.com/";
    
    
    // --- Admin Page ---
    if (document.URL.match("admin")) {
        let addLinkForm: HTMLFormElement = document.forms.namedItem("add-link-form");
        addLinkForm.addEventListener("submit", handleFormSubmit);
        
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

        // Admin Cards Delete Btn
        function deleteCards(): void {
            let htmlCards: NodeList = document.querySelectorAll(".card-container");
        }


        async function doAsync(): Promise<void> {
            let cardArea: HTMLElement = document.getElementById("game-cards");
            await displayCards(cardArea);
            deleteCards();
        }
        doAsync();

    }
    // --- Game Page ---
    if (document.URL.match("game")) {
        async function doAsync(): Promise<void> {
            let cardArea: HTMLElement = document.getElementById("game-cards");
            await displayCards(cardArea);
            let htmlCards: NodeList = document.querySelectorAll(".card");
            htmlCards.forEach(card => {
                card.addEventListener("click", handleCardClick);
                
            });
        }
        doAsync();
        
    }
    function handleCardClick(_event: Event): void {
        let clickedCard: HTMLElement = _event.currentTarget;
        console.log(_event.currentTarget.attributes.id);
    }
    // --- Cards ---
    interface Card {
        id: string;
        link: string;
    }
    async function getCards(): Promise<Card[]> {
        let url: string = serverUrl;
        url = url + "getCards/";
        let response: Response = await fetch(url);
        let cards: Card[] = JSON.parse(await response.text());
        return cards;
    }
    async function giveCardsID(): Promise<Card[]> {
        let cardsIds1: string[] = ["a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0"];
        let cards1: Card[] = await getCards();
        let cardsIds: string[] = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
        let cards: Card[] = await getCards();
        for (const i in cards) {
            cards[i].id = cardsIds[i];  
        }
        for (const i in cards1) {
            cards1[i].id = cardsIds1[i];  
        }
        let cardsAndIds: Card[] = cards.concat(cards1);
        return cardsAndIds;
    }
    async function displayCards(_placeInside: HTMLElement): Promise<void> {
        let cardsAndIds: Card[] = await giveCardsID();
        for (const card of cardsAndIds ) {
        let htmlCard: HTMLElement = document.createElement("div");
        htmlCard.classList.add("card-container");
        htmlCard.innerHTML = `<div class="card" id="${card.id}"><div class="card-back"></div><div class="card-front"><img src="${card.link}"alt="Memory Card"></div>`;
        _placeInside.appendChild(htmlCard);
            }

    }
}
