namespace script {
    export let serverUrl: string = "http://localhost:8100/";
    // export let serverUrl: string = "https://testgisjk.herokuapp.com/";
    
    
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
    let startTimeFix: number = Date.now(); 
    let sec: number = 0;
    let min: number = 0;
    
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
        console.log(responseValue);
        localStorage.clear();
        window.location.replace("./score.html");
    }
    function displayCurrentScore(): void {
        let displayArea: HTMLElement = document.getElementById("current-score");
        let score: number = JSON.parse(localStorage.getItem("finalScoreInMs"));
        displayArea.innerText = score.toLocaleString();
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
        scoreHtmlElement.innerHTML = `<p>Name: ${score.name} </p><p>Zeit: ${score.score}</p>`;
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
        let formInput: HTMLElement = <HTMLElement> _event.currentTarget.getElementsByTagName("input")[0];
        let url: string = serverUrl + "addCard/";
        let formData: FormData = new FormData(<HTMLFormElement>_event.currentTarget);
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        url = url + "?" + query.toString();
        let response: Response = await fetch(url);
        let responseValue: string = await response.text();
        console.log(responseValue);
        await displayCards(cardArea, true);
        addEventListenerDeleteCards();
        formInput.value = "";
    }


    // Admin Cards Delete Btn
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
        await displayCards(cardArea, true);
        addEventListenerDeleteCards();

    }
    async function deleteCardFromDB(_link: string): Promise<void> {
        let url: string = serverUrl + "deleteCard/";
        let query: URLSearchParams = new URLSearchParams(<any>{link: _link});
        url = url + "?" + query.toString();
        let response: Response = await fetch(url);
        let responseValue: string = await response.text();
        console.log(responseValue);
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
            if (cardsAreEqual(rotatedCards[0], rotatedCards[1])){
                console.log("Karten Gleich");
                setTimeout(() => {
                    cardArea.removeChild(rotatedCards[0].parentElement);
                    cardArea.removeChild(rotatedCards[1].parentElement);
                    let cards: NodeList = document.querySelectorAll(".card");
                    console.log(cards);
                    
                    if (cards.length === 0) {
                        gameFinished();
                    }
                    addEventListenerToCards();
                },         2000);
            } else {
                console.log("Karten ungleich");
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
        if (timer >= 950) {
            sec++;
            startTime = Date.now();
        }
        if (sec === 60) {
            min++;
            sec = 0;
        }
        let htmlTimer: HTMLElement = document.getElementById("game-timer");
        htmlTimer.innerText = `${min.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${sec.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${timer.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}`;
    }
    function gameFinished(): void {
        let finalScoreInMs: number = Date.now() - startTimeFix;
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
        if (_showFront) {
            showFrontClass = "rotate-card";
        }
        let cardsAndIds: Card[] = await giveCardsID();
        for (const card of cardsAndIds ) {
        let htmlCard: HTMLElement = document.createElement("div");
        htmlCard.classList.add("card-container");
        htmlCard.style.gridArea = card.id;
        htmlCard.innerHTML = `<div class="card ${showFrontClass}" id="${card.id}"><div class="card-back"></div><div class="card-front"><img src="${card.link}"alt="Memory Card"></div>`;
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
                console.log("first Turn");  
                firstTurn = true;
                } else if (firstTurn === true && secondTurn === false) {
                    console.log("second turn");
                    secondTurn = true;
                }
            startGame();
    }

    // Globale Funktionen
    function msToMinMinSecSecMsMs(_ms: number): string {
        let min: number = 0;
        let sec: number = 0;
        let ms: number = 0;
        if (_ms >= 1000) {
            if (_ms >= 1000) {
                sec++;
                _ms = _ms - 1000;
            }
            if (sec >= 60) {
                min++;
            }
            msToMinMinSecSecMsMs(_ms);
        } else {
            _ms = ms;
            return `${min.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${sec.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${ms.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}`;
        }
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array: string[] | number[]): void {
        array.sort(() => Math.random() - 0.5);
    }
    
}
