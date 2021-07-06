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
    let firstTurn: boolean = false;
    let secondTurn: boolean = false;
    if (document.URL.match("game")) {
        async function doAsync(): Promise<void> {
            let cardArea: HTMLElement = document.getElementById("game-cards");
            await displayCards(cardArea);
            addEventListenerToCards();
        }
        randomGrid();
        doAsync();
        
    }

    // Game Funktionen
    function startGame() {
        let gameIsRunning = false;
        if (firstTurn === true && gameIsRunning === false) {
            // start timer
            gameIsRunning = true;
        } else if (true) {

        }
    }
    function cardsAreEqual(card1: Card, card2: Card): boolean {
        if (card1.id.startsWith(card2.id)) {
            return true;
        }
        return false; 
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
        htmlCard.style.gridArea = card.id;
        htmlCard.innerHTML = `<div class="card" id="${card.id}"><div class="card-back"></div><div class="card-front"><img src="${card.link}"alt="Memory Card"></div>`;
        _placeInside.appendChild(htmlCard);
            }

    }
    function  randomGrid(): void {
        let grid: HTMLElement = document.getElementById("game-cards");
        let cardsIdsAll: string[] =  ["a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
        shuffle(cardsIdsAll);
        let row1: string = cardsIdsAll.slice(0, 4).join(" ");
        let row2: string = cardsIdsAll.slice(4, 8).join(" ");
        let row3: string = cardsIdsAll.slice(8, 12).join(" ");
        let row4: string = cardsIdsAll.slice(12, 16).join(" ");
        grid.style.gridTemplateAreas = `"${row1}" "${row2}" "${row3}" "${row4}"`;
        
    }
    function addEventListenerToCards(): void {
    let htmlCards: HTMLElement[] = Array.from(document.querySelectorAll(".card"));
    htmlCards.forEach(card => {
        card.addEventListener("click", function(): void {
            card.classList.add("rotate-card");
            if (firstTurn === false) {
                console.log("first Turn");  
                firstTurn = true;
                } else if (firstTurn === true && secondTurn === false) {
                    console.log("second turn");
                    secondTurn = true;
                }
            console.log("eine Karte gedreht " + firstTurn);
            console.log("zwei Karten gedreht " + secondTurn);
                });
            });
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array: string[] | number[]): void {
        array.sort(() => Math.random() - 0.5);
}
}
