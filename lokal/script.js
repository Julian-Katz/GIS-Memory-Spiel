"use strict";
var script;
(function (script) {
    //script.serverUrl = "http://localhost:8100/";
    let serverUrl: string = "https://testgisjk.herokuapp.com/";
    // --- Admin Page ---
    let cardArea = document.getElementById("game-cards");
    if (document.URL.match("admin")) {
        async function doAsync() {
            await displayCards(cardArea, true);
            addEventListenerDeleteCards();
        }
        doAsync();
        // Admin Form
        let addLinkForm = document.forms.namedItem("add-link-form");
        addLinkForm.addEventListener("submit", handleFormSubmit);
    }
    // --- Game Page ---
    let firstTurn = false;
    let secondTurn = false;
    let gameIsRunning = false;
    let startTime = Date.now();
    let startTimeFix = Date.now();
    let sec = 0;
    let min = 0;
    if (document.URL.match("game")) {
        async function doAsync() {
            await displayCards(cardArea);
            addEventListenerToCards();
        }
        randomGrid();
        doAsync();
    }
    // Admin Funktionen
    async function handleFormSubmit(_event) {
        _event.preventDefault();
        let formInput = _event.currentTarget.getElementsByTagName("input")[0];
        console.log(formInput);
        let url = script.serverUrl + "addCard/";
        let formData = new FormData(_event.currentTarget);
        let query = new URLSearchParams(formData);
        url = url + "?" + query.toString();
        let response = await fetch(url);
        let responseValue = await response.text();
        console.log(responseValue);
        await displayCards(cardArea, true);
        addEventListenerDeleteCards();
        formInput.value = "";
    }
    // Admin Cards Delete Btn
    function addEventListenerDeleteCards() {
        let htmlCards = Array.from(document.querySelectorAll(".card-container"));
        htmlCards.forEach((card) => {
            card.addEventListener("click", handleCardDelete);
        });
    }
    async function handleCardDelete(_event) {
        let card = _event.currentTarget.firstChild;
        let cardId = card.id.charAt(0);
        let secondCard = document.getElementById(`${cardId}0`).parentElement;
        let firstCard = document.getElementById(`${cardId}1`).parentElement;
        cardArea.removeChild(secondCard);
        cardArea.removeChild(firstCard);
        let imgElement = card.getElementsByTagName("img")[0];
        let imgLink = imgElement.src;
        await deleteCardFromDB(imgLink);
        await displayCards(cardArea, true);
        addEventListenerDeleteCards();
    }
    async function deleteCardFromDB(_link) {
        let url = script.serverUrl + "deleteCard/";
        let query = new URLSearchParams({ link: _link });
        url = url + "?" + query.toString();
        let response = await fetch(url);
        let responseValue = await response.text();
        console.log(responseValue);
    }
    // Game Funktionen
    function startGame() {
        if (firstTurn === true && gameIsRunning === false) {
            // start timer
            startTimer();
            gameIsRunning = true;
        }
        else if (firstTurn === true && secondTurn === true) {
            removeEventListenerFromCards();
            let rotatedCards = Array.from(document.querySelectorAll(".rotate-card"));
            if (cardsAreEqual(rotatedCards[0], rotatedCards[1])) {
                console.log("Karten Gleich");
                setTimeout(() => {
                    cardArea.removeChild(rotatedCards[0].parentElement);
                    cardArea.removeChild(rotatedCards[1].parentElement);
                    let cards = document.querySelectorAll(".card");
                    console.log(cards);
                    if (cards.length === 0) {
                        gameFinished();
                    }
                    addEventListenerToCards();
                }, 2000);
            }
            else {
                console.log("Karten ungleich");
                setTimeout(() => {
                    rotatedCards[0].classList.remove("rotate-card");
                    rotatedCards[1].classList.remove("rotate-card");
                    addEventListenerToCards();
                }, 2000);
            }
            firstTurn = false;
            secondTurn = false;
        }
    }
    function cardsAreEqual(card1, card2) {
        if (card1.id.charAt(0) === card2.id.charAt(0)) {
            return true;
        }
        return false;
    }
    function startTimer() {
        setInterval(handleAddOneSecond, 100);
    }
    function handleAddOneSecond() {
        let timer = Date.now() - startTime;
        if (timer >= 950) {
            sec++;
            startTime = Date.now();
        }
        if (sec === 60) {
            min++;
            sec = 0;
        }
        let htmlTimer = document.getElementById("game-timer");
        htmlTimer.innerText = `${min.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${sec.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${timer.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}`;
    }
    function gameFinished() {
        let finalTimerTimeinMs = Date.now() - startTimeFix;
        localStorage.setItem("finalTimerTimeinMs", JSON.stringify(finalTimerTimeinMs));
        console.log(localStorage.getItem("finalTimerTimeinMs"));
        window.location.replace("./gameDone.html");
    }
    async function getCards() {
        let url = script.serverUrl;
        url = url + "getCards/";
        let response = await fetch(url);
        let cards = JSON.parse(await response.text());
        return cards;
    }
    async function giveCardsID() {
        let cardsIds1 = ["a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0"];
        let cards1 = await getCards();
        let cardsIds = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
        let cards = await getCards();
        for (const i in cards) {
            cards[i].id = cardsIds[i];
        }
        for (const i in cards1) {
            cards1[i].id = cardsIds1[i];
        }
        let cardsAndIds = cards.concat(cards1);
        return cardsAndIds;
    }
    async function displayCards(_placeInside, _showFront) {
        let showFrontClass = "";
        if (_showFront) {
            showFrontClass = "rotate-card";
        }
        let cardsAndIds = await giveCardsID();
        for (const card of cardsAndIds) {
            let htmlCard = document.createElement("div");
            htmlCard.classList.add("card-container");
            htmlCard.style.gridArea = card.id;
            htmlCard.innerHTML = `<div class="card ${showFrontClass}" id="${card.id}"><div class="card-back"></div><div class="card-front"><img src="${card.link}"alt="Memory Card"></div>`;
            _placeInside.appendChild(htmlCard);
        }
    }
    function randomGrid() {
        let grid = document.getElementById("game-cards");
        let cardsIdsAll = ["a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
        shuffle(cardsIdsAll);
        let row1 = cardsIdsAll.slice(0, 4).join(" ");
        let row2 = cardsIdsAll.slice(4, 8).join(" ");
        let row3 = cardsIdsAll.slice(8, 12).join(" ");
        let row4 = cardsIdsAll.slice(12, 16).join(" ");
        grid.style.gridTemplateAreas = `"${row1}" "${row2}" "${row3}" "${row4}"`;
    }
    function addEventListenerToCards() {
        let htmlCards = Array.from(document.querySelectorAll(".card"));
        htmlCards.forEach(card => {
            card.addEventListener("click", handleCardTurn);
        });
    }
    function removeEventListenerFromCards() {
        let htmlCards = Array.from(document.querySelectorAll(".card"));
        htmlCards.forEach(card => {
            card.removeEventListener("click", handleCardTurn);
        });
    }
    function handleCardTurn(_event) {
        let card = _event.currentTarget;
        card.classList.add("rotate-card");
        card.removeEventListener("click", handleCardTurn);
        if (firstTurn === false) {
            console.log("first Turn");
            firstTurn = true;
        }
        else if (firstTurn === true && secondTurn === false) {
            console.log("second turn");
            secondTurn = true;
        }
        startGame();
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }
})(script || (script = {}));
//# sourceMappingURL=script.js.map
