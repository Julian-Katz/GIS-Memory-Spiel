"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const url = require("url");
const Mongo = require("mongodb");
var Server;
(function (Server) {
    // Add new Cards
    let addNewCardsAllowed = false;
    let cards = [];
    // Http Requests
    let server = Http.createServer();
    let port = process.env.PORT;
    if (port === undefined) {
        port = 8100;
    }
    server.addListener("request", handleRequests);
    server.listen(port);
    async function handleRequests(_request, _response) {
        let currentUrl = url.parse(_request.url, true);
        switch (currentUrl.pathname) {
            case "/getCards/":
                console.log("Karten werden an CLient gesendet");
                _response.setHeader("content-type", "json; charset=utf-8");
                _response.setHeader("Access-Control-Allow-Origin", "*");
                _response.write(cards);
                break;
            case "/":
                console.log("Link wurde gesendet");
                _response.setHeader("content-type", "text/html; charset=utf-8");
                _response.setHeader("Access-Control-Allow-Origin", "*");
                _response.write("Die Daten wurden an den Server übertragen.");
                break;
        }
        _response.end();
    }
    // Database
    let databaseUrl = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
    let options = { useNewUrlParser: true, useUnifiedTopology: true };
    let mongoClient = new Mongo.MongoClient(databaseUrl, options);
    async function connecttoDatabase() {
        await mongoClient.connect();
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 9) {
                addNewCardsAllowed = true;
            }
        });
    }
    connecttoDatabase();
    // DB functions
    async function loadCardsFromDbReturnLength() {
        let cardLinks = await mongoClient.db("memory").collection("cards").find().toArray();
        cards = [];
        for (const i of cardLinks) {
            cards.push(linkToCard(i.link));
        }
        return cards.length;
    }
    function deleteByLinkFromDb(_link) {
        mongoClient.db("memory").collection("cards").findOneAndDelete({ link: _link });
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 9) {
                addNewCardsAllowed = true;
            }
            else {
                addNewCardsAllowed = false;
            }
        });
    }
    function addByLinkToDb(_link) {
        mongoClient.db("memory").collection("cards").insertOne({ link: _link });
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 8) {
                addNewCardsAllowed = true;
            }
            else {
                addNewCardsAllowed = false;
            }
        });
    }
    // General Functions
    function linkToCard(_link, _id) {
        let card = { id: _id, link: _link };
        return card;
    }
})(Server || (Server = {}));
//# sourceMappingURL=server.js.map