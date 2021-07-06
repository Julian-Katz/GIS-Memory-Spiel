"use strict";
var script;
(function (script) {
    let serverUrl = "http://localhost:8100/";
    // let serverUrl: string = "https://testgisjk.herokuapp.com/";
    // --- Admin Page ---
    if (document.URL.match("admin")) {
        let addLinkForm = document.forms.namedItem("add-link-form");
        addLinkForm.addEventListener("submit", handleFormSubmit);
        async function handleFormSubmit(_event) {
            _event.preventDefault();
            let url = serverUrl;
            let formData = new FormData(addLinkForm);
            let query = new URLSearchParams(formData);
            url = url + "?" + query.toString();
            let response = await fetch(url);
            let responseValue = await response.text();
            console.log(responseValue);
        }
        // Admin Cards Delete Btn
        function deleteCards() {
            let htmlCards = document.querySelectorAll(".card-container");
        }
        async function doAsync() {
            let cardArea = document.getElementById("game-cards");
            await displayCards(cardArea);
            deleteCards();
        }
        doAsync();
    }
    // --- Game Page ---
    let firstTurn = false;
    let secondTurn = false;
    if (document.URL.match("game")) {
        async function doAsync() {
            let cardArea = document.getElementById("game-cards");
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
        }
    }
    function cardsAreEqual(card1, card2) {
        if (card1.id.startsWith(card2.id)) {
            return true;
        }
        return false;
    }
    async function getCards() {
        let url = serverUrl;
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
    async function displayCards(_placeInside) {
        let cardsAndIds = await giveCardsID();
        for (const card of cardsAndIds) {
            let htmlCard = document.createElement("div");
            htmlCard.classList.add("card-container");
            htmlCard.style.gridArea = card.id;
            htmlCard.innerHTML = `<div class="card" id="${card.id}"><div class="card-back"></div><div class="card-front"><img src="${card.link}"alt="Memory Card"></div>`;
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
            card.addEventListener("click", function () {
                card.classList.add("rotate-card");
                if (firstTurn === false) {
                    console.log("first Turn");
                    firstTurn = true;
                }
                else if (firstTurn === true && secondTurn === false) {
                    console.log("second turn");
                    secondTurn = true;
                }
                console.log("eine Karte gedreht " + firstTurn);
                console.log("zwei Karten gedreht " + secondTurn);
            });
        });
    }
    // Funktion von hier: https://javascript.info/task/shuffle
    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }
})(script || (script = {}));
//# sourceMappingURL=script.js.map