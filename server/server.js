"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        try {
            let currentUrl = url.parse(_request.url, true);
            switch (currentUrl.pathname) {
                case "/getCards/":
                    _response.setHeader("content-type", "json; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    _response.write(JSON.stringify(await getCards()));
                    console.log("Karten wurden an CLient gesendet");
                    break;
                case "/addCard/":
                    _response.setHeader("content-type", "text/html; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    let addUrl = currentUrl.query;
                    if (await addNewCardsAllowed()) {
                        await addCardByLinkToDb(addUrl["link"]);
                        _response.write("Karte wurde hinzugefügt");
                    }
                    else {
                        _response.write("Maximale Anzahl an Karten erreicht");
                    }
                    break;
                case "/deleteCard/":
                    _response.setHeader("content-type", "text/html; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    let deleteUrl = currentUrl.query;
                    await deleteCardByLinkFromDb(deleteUrl["link"]);
                    _response.write("Die Karte wurde gelöscht.");
                    break;
                case "/getScores/":
                    _response.setHeader("content-type", "json; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    _response.write(JSON.stringify(await getScores()));
                    console.log("Scores wurden an CLient gesendet");
                    break;
                case "/addScore/":
                    _response.setHeader("content-type", "text/html; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    let score = currentUrl.query;
                    await addScore(score);
                    _response.write("Score in DB geschrieben");
                    break;
            }
            _response.end();
        }
        catch (error) {
            console.log(error);
        }
    }
    // Database
    let databaseUrl = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
    let mongoClient = new Mongo.MongoClient(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    async function connectDB() {
        try {
            if (mongoClient.isConnected) {
                await mongoClient.connect();
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    // Database Get Data
    // Cards
    async function getCards() {
        await connectDB();
        let cards = [];
        let cardLinks = await mongoClient.db("memory").collection("cards").find().toArray();
        for (const i of cardLinks) {
            cards.push(linkToCard(i.link, null));
        }
        return cards;
    }
    async function addNewCardsAllowed() {
        await connectDB();
        if (await mongoClient.db("memory").collection("cards").countDocuments() < 8) {
            return true;
        }
        else {
            return false;
        }
    }
    // Scores
    async function getScores() {
        await connectDB();
        let scores = [];
        let scoresDb = await mongoClient.db("memory").collection("scores").find().toArray();
        for (const i of scoresDb) {
            delete i._id;
            scores.push(i);
        }
        return scores;
    }
    // Database write Data
    // Cards
    async function deleteCardByLinkFromDb(_link) {
        await connectDB();
        mongoClient.db("memory").collection("cards").findOneAndDelete({ link: _link });
    }
    async function addCardByLinkToDb(_link) {
        await connectDB();
        if (await addNewCardsAllowed()) {
            mongoClient.db("memory").collection("cards").insertOne({ link: _link });
            return "Karte wurde hinzugefügt";
        }
        else {
            return "Maximal 8 Karten möglich";
        }
    }
    // Scores
    async function addScore(_score) {
        await connectDB();
        mongoClient.db("memory").collection("scores").insertOne(_score);
    }
    // General Functions
    function linkToCard(_link, _id) {
        let card = { id: _id, link: _link };
        return card;
    }
})(Server || (Server = {}));
//# sourceMappingURL=server.js.map