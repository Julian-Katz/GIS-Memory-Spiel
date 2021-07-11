namespace script {
    // let serverUrl: string = "http://localhost:8100/";
    let serverUrl: string = "https://testgisjk.herokuapp.com/";
    
    // --- Index Page ---
    if (document.URL.match("index.html")) {
        async function doAsync(): Promise<void> {
            if ((await getCards()).length === 8) {
                let startLink: HTMLLinkElement =  <HTMLLinkElement> document.getElementById("start-link");
                startLink.href = "./game.html";
            } else {
                showMessage("Füge unter Einstellungen Karten hinzu!", "bad");
            }
        }
        doAsync();
    }
    // --- Admin Page ---
    let cardArea: HTMLElement = document.getElementById("game-cards");             
    if (document.URL.match("admin.html")) {
        async function doAsync(): Promise<void> {
            await displayCards(cardArea, true);
            addEventListenerDeleteCards();
        }
        doAsync();
        // Admin Form
        let addLinkForm: HTMLFormElement = document.forms.namedItem("add-link-form");
        addLinkForm.addEventListener("submit", handleFormSubmit);
    }
    // --- Game Page ---
    let firstTurn: boolean = false;
    let secondTurn: boolean = false;
    let gameIsRunning: boolean = false;
    let startTime: number = Date.now(); 
    
    if (document.URL.match("game.html")) {
        async function doAsync(): Promise<void> {
            await displayCards(cardArea);
            addEventListenerToCards();
        }
        randomGrid();
        doAsync();
        
    }
    // ---- Game Done ----
    if (document.URL.match("gameDone.html")) {
        displayCurrentScore();
        let addScoreForm: HTMLFormElement = document.forms.namedItem("add-score-form");
        addScoreForm.addEventListener("submit", handleAddScoreForm);
    }
    // ---- Scores----
    if (document.URL.match("score.html")) {
        let scoresContainer: HTMLElement = document.querySelector(".scores");
        displayScores(scoresContainer);
        
    }
    
    // ---- Game Done Funktionen ----
    async function handleAddScoreForm(_event: Event): Promise<void> {
        _event.preventDefault();
        let formData: FormData = new FormData(<HTMLFormElement>_event.currentTarget);
        let url: string = serverUrl + "addScore/";
        let score: string = JSON.parse(localStorage.getItem("finalScoreInMs"));
        formData.set("score", score); 
        formData.set("score", localStorage.getItem("finalScoreInMs"));
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        url = url + "?" + query.toString();
        let response: Response = await fetch(url);
        let responseValue: string = await response.text();
        showMessage(responseValue, "good");
        localStorage.clear();
        window.location.replace("./score.html");
    }
    function displayCurrentScore(): void {
        let displayArea: HTMLElement = document.getElementById("current-score");
        let score: number = JSON.parse(localStorage.getItem("finalScoreInMs"));
        displayArea.innerText = msToMinMinSecSecMsMs(score);
    } 
      
    // ---- Scores Funktionen ----
    interface Score {
        name: string;
        score: number;
    }
    async function displayScores(_placeInside: HTMLElement): Promise<void> {
        let scores: Score[] = await getScores();
        scores.sort((a: Score, b: Score): number => {
            return a.score - b.score;
        });
        scores.forEach((score) => {
        let scoreHtmlElement: HTMLElement = document.createElement("div");
        scoreHtmlElement.classList.add("score");
        scoreHtmlElement.innerHTML = `<p>Name: ${score.name} </p><p>Zeit: ${msToMinMinSecSecMsMs(score.score)}</p>`;
        _placeInside.appendChild(scoreHtmlElement);
        });
    }
    async function getScores(): Promise<Score[]> {
        let url: string = serverUrl + "getScores/";
        let response: Response = await fetch(url);
        let responseValue: Score[] = await response.json();
        return responseValue;
    }

    // ---- Admin Funktionen ----
    async function handleFormSubmit(_event: Event): Promise<void> {
        _event.preventDefault();
        let formInput: HTMLFormElement = <HTMLFormElement> _event.currentTarget.getElementsByTagName("input")[0];
        let url: string = serverUrl + "addCard/";
        let formData: FormData = new FormData(<HTMLFormElement>_event.currentTarget);
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        url = url + "?" + query.toString();
        let response: Response = await fetch(url);
        let responseValue: string = await response.text();
        if (responseValue === "Maximale Anzahl an Karten erreicht") {
            showMessage(responseValue, "bad");
        } else {
            showMessage(responseValue, "good");
        }
        await displayCards(cardArea, true);
        addEventListenerDeleteCards();
        formInput.value = "";
    }

    function addEventListenerDeleteCards(): void {
        let htmlCards: HTMLElement[] = Array.from(document.querySelectorAll(".card-container"));
        htmlCards.forEach((card) => {
            card.addEventListener("click", handleCardDelete);
        });
    }
    async function handleCardDelete(_event: Event): Promise<void> {
        let card: HTMLElement = <HTMLElement> _event.currentTarget.firstChild;
        let cardId: string = card.id.charAt(0);
        let secondCard: HTMLElement = document.getElementById(`${cardId}0`).parentElement;
        let firstCard: HTMLElement = document.getElementById(`${cardId}1`).parentElement;
        cardArea.removeChild(secondCard);
        cardArea.removeChild(firstCard);
        let imgElement: HTMLImageElement = card.getElementsByTagName("img")[0];
        let imgLink: string = imgElement.src;
        await deleteCardFromDB(imgLink);
        addEventListenerDeleteCards();

    }
    async function deleteCardFromDB(_link: string): Promise<void> {
        let url: string = serverUrl + "deleteCard/";
        let query: URLSearchParams = new URLSearchParams(<any>{link: _link});
        url = url + "?" + query.toString();
        let response: Response = await fetch(url);
        let responseValue: string = await response.text();
        showMessage(responseValue, "good");
    }

    // ---- Game Funktionen ----
    function startGame(): void {
        if (firstTurn === true && gameIsRunning === false) {
            // start timer
            startTimer();
            gameIsRunning = true;
        } else if (firstTurn === true && secondTurn === true) {
            removeEventListenerFromCards();
            let rotatedCards: HTMLElement[] = Array.from(document.querySelectorAll(".rotate-card"));
            if (cardsAreEqual(rotatedCards[0], rotatedCards[1])) {
                setTimeout(() => {
                    cardArea.removeChild(rotatedCards[0].parentElement);
                    cardArea.removeChild(rotatedCards[1].parentElement);
                    let cards: NodeList = document.querySelectorAll(".card");
                    
                    if (cards.length === 0) {
                        gameFinished();
                    }
                    addEventListenerToCards();
                },         2000);
            } else {
                setTimeout(() => {
                        rotatedCards[0].classList.remove("rotate-card");
                        rotatedCards[1].classList.remove("rotate-card");
                        addEventListenerToCards();
                    },     2000);
                }
            firstTurn = false;
            secondTurn = false;
        }
    }
    function cardsAreEqual (card1: HTMLElement, card2: HTMLElement): boolean {
        if (card1.id.charAt(0) === card2.id.charAt(0)) {
            return true;
        }
        return false; 
    }
    function startTimer(): void {
        setInterval(handleAddOneSecond, 100);
    }
    function handleAddOneSecond(): void {
        let timer: number = Date.now() - startTime;
        let htmlTimer: HTMLElement = document.getElementById("game-timer");
        htmlTimer.innerText = msToMinMinSecSecMsMs(timer);
    }
    function gameFinished(): void {
        let finalScoreInMs: number = Date.now() - startTime;
        localStorage.setItem("finalScoreInMs", JSON.stringify(finalScoreInMs));
        window.location.replace("./gameDone.html");
    }

    // --- Cards Funktionen ---
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
    async function displayCards(_placeInside: HTMLElement, _showFront?: boolean): Promise<void> {
        let showFrontClass: string = "";
        let svgBinString: string = "";
        if (_showFront) {
            showFrontClass = "rotate-card";
            svgBinString = `<svg class="bin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!-- Font Awesome Free 5.15.3 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"/></svg>`;

        }
        let cardsAndIds: Card[] = await giveCardsID();
        for (const card of cardsAndIds ) {
        let htmlCard: HTMLElement = document.createElement("div");
        htmlCard.classList.add("card-container");
        htmlCard.style.gridArea = card.id;
        htmlCard.innerHTML = `<div class="card ${showFrontClass}" id="${card.id}"><div class="card-back"></div><div class="card-front">${svgBinString}<img src="${card.link}"alt="Memory Card"></div>`;
        _placeInside.appendChild(htmlCard);
            }

    }
    function  randomGrid(): void {
        let grid: HTMLElement = document.getElementById("game-cards");
        let cardsIdsAll: string[] =  ["a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
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
        card.addEventListener("click", handleCardTurn);
            });
    }
    function removeEventListenerFromCards(): void {
    let htmlCards: HTMLElement[] = Array.from(document.querySelectorAll(".card"));
    htmlCards.forEach(card => {
        card.removeEventListener("click", handleCardTurn);
            });
    }
    function handleCardTurn(_event: Event): void {
            let card: HTMLElement = <HTMLElement> _event.currentTarget;
            card.classList.add("rotate-card");
            card.removeEventListener("click", handleCardTurn);
            if (firstTurn === false) {
                firstTurn = true;
                } else if (firstTurn === true && secondTurn === false) {
                    secondTurn = true;
                }
            startGame();
    }
 
    // Message
    function showMessage(_message: string, _type?: string): void {
        let messageArea: HTMLElement = document.querySelector(".message");
        messageArea.classList.add("show-message");
        messageArea.innerHTML = `<p>${_message}</p>`;
        if (_type === "bad") {
            messageArea.style.background = "rgba(255, 53, 53, 0.466)";
        } else if (_type === "good") {
            messageArea.style.background = "rgba(0, 255, 13, 0.466)";
        }
        setTimeout(() => {
            messageArea.classList.remove("show-message");
        },         3000);
    }

    // Globale Funktionen
    function msToMinMinSecSecMsMs(_ms: number): string {
        let min: number = 0;
        let sec: number = 0;
        let ms: number = 0;

        sec = Math.floor(_ms / 1000);
        ms = _ms % 1000;
        
        min = Math.floor(sec / 60);
        sec = sec % 60;

        return `${min.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${sec.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${ms.toLocaleString("de", { minimumIntegerDigits: 3, useGrouping: false })}`;
     
            
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array: string[] | number[]): void {
        array.sort(() => Math.random() - 0.5);
    } 
}

