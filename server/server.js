"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// application/json
const Http = require("http");
const url = require("url");
const Mongo = require("mongodb");
var Server;
(function (Server) {
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
                _response.write(JSON.stringify(await getCards()));
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
    // Database Get Data
    let databaseUrl = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
    let mongoClient = new Mongo.MongoClient(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    async function getCards() {
        let cards = [];
        await mongoClient.connect();
        let cardLinks = await mongoClient.db("memory").collection("cards").find().toArray();
        mongoClient.close();
        for (const i of cardLinks) {
            cards.push(linkToCard(i.link));
        }
        return cards;
    }
    async function addNewCardsAllowed() {
        await mongoClient.connect();
        if (await mongoClient.db("memory").collection("cards").countDocuments() < 8) {
            return true;
        }
        else {
            return false;
        }
    }
    // Database write Data
    function deleteByLinkFromDb(_link) {
        mongoClient.db("memory").collection("cards").findOneAndDelete({ link: _link });
    }
    function addByLinkToDb(_link) {
        mongoClient.db("memory").collection("cards").insertOne({ link: _link });
    }
    // General Functions
    function linkToCard(_link, _id) {
        let card = { id: _id, link: _link };
        return card;
    }
    async function log() {
        console.log(await addNewCardsAllowed());
    }
    log();
})(Server || (Server = {}));
//# sourceMappingURL=server.js.map