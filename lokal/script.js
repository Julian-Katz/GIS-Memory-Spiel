"use strict";
var script;
(function (script) {
    // export let serverUrl: string = "http://localhost:8100/";
    script.serverUrl = "https://testgisjk.herokuapp.com/";
    // --- Admin Page ---
    let cardArea = document.getElementById("game-cards");
    if (document.URL.match("admin.html")) {
        async function doAsync() {
            await displayCards(cardArea, true);
            addEventListenerDeleteCards();
            addBin();
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
    if (document.URL.match("game.html")) {
        async function doAsync() {
            await displayCards(cardArea);
            addEventListenerToCards();
        }
        randomGrid();
        doAsync();
    }
    // ---- Game Done ----
    if (document.URL.match("gameDone.html")) {
        displayCurrentScore();
        let addScoreForm = document.forms.namedItem("add-score-form");
        addScoreForm.addEventListener("submit", handleAddScoreForm);
    }
    // ---- Scores----
    if (document.URL.match("score.html")) {
        let scoresContainer = document.querySelector(".scores");
        displayScores(scoresContainer);
    }
    // ---- Game Done Funktionen ----
    async function handleAddScoreForm(_event) {
        _event.preventDefault();
        let formData = new FormData(_event.currentTarget);
        let url = script.serverUrl + "addScore/";
        let score = JSON.parse(localStorage.getItem("finalScoreInMs"));
        formData.set("score", score);
        formData.set("score", localStorage.getItem("finalScoreInMs"));
        let query = new URLSearchParams(formData);
        url = url + "?" + query.toString();
        let response = await fetch(url);
        let responseValue = await response.text();
        console.log(responseValue);
        localStorage.clear();
        window.location.replace("./score.html");
    }
    function displayCurrentScore() {
        let displayArea = document.getElementById("current-score");
        let score = JSON.parse(localStorage.getItem("finalScoreInMs"));
        displayArea.innerText = score.toLocaleString();
    }
    async function displayScores(_placeInside) {
        let scores = await getScores();
        scores.sort((a, b) => {
            return a.score - b.score;
        });
        scores.forEach((score) => {
            let scoreHtmlElement = document.createElement("div");
            scoreHtmlElement.classList.add("score");
            scoreHtmlElement.innerHTML = `<p>Name: ${score.name} </p><p>Zeit: ${score.score}</p>`;
            _placeInside.appendChild(scoreHtmlElement);
        });
    }
    async function getScores() {
        let url = script.serverUrl + "getScores/";
        let response = await fetch(url);
        let responseValue = await response.json();
        return responseValue;
    }
    // ---- Admin Funktionen ----
    async function handleFormSubmit(_event) {
        _event.preventDefault();
        let formInput = _event.currentTarget.getElementsByTagName("input")[0];
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
        // await displayCards(cardArea, true);
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
    function addBin() {
        let cardFronts = Array.from(document.querySelectorAll(".card-front"));
        let svg = document.createElement("svg");
        svg.classList.add("bin");
        svg.dataset.viewBox = "0 0 448 512";
        svg.innerHTML = `<path d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"/>`;
        cardFronts.forEach((cardFront) => {
            cardFront.prepend(svg);
        });
    }
    // ---- Game Funktionen ----
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
        let finalScoreInMs = Date.now() - startTimeFix;
        localStorage.setItem("finalScoreInMs", JSON.stringify(finalScoreInMs));
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
    // Globale Funktionen
    function msToMinMinSecSecMsMs(_ms) {
        let min = 0;
        let sec = 0;
        let ms = 0;
        if (_ms >= 1000) {
            if (_ms >= 1000) {
                sec++;
                _ms = _ms - 1000;
            }
            if (sec >= 60) {
                min++;
            }
            msToMinMinSecSecMsMs(_ms);
        }
        else {
            _ms = ms;
            return `${min.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${sec.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}:${ms.toLocaleString("de", { minimumIntegerDigits: 2, useGrouping: false })}`;
        }
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }
})(script || (script = {}));
//# sourceMappingURL=script.js.map