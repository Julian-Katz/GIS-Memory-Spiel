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
        try {
            let currentUrl = url.parse(_request.url, true);
            switch (currentUrl.pathname) {
                case "/getCards/":
                    _response.setHeader("content-type", "text; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    _response.write(JSON.stringify(await getCards()));
                    console.log("Karten wurden an CLient gesendet");
                    break;
                case "/":
                    _response.setHeader("content-type", "text/html; charset=utf-8");
                    _response.setHeader("Access-Control-Allow-Origin", "*");
                    _response.write("Die Daten wurden an den Server übertragen.");
                    console.log("Link erhalten");
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
    // Database write Data
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
    // General Functions
    function linkToCard(_link, _id) {
        let card = { id: _id, link: _link };
        return card;
    }
})(Server || (Server = {}));
//# sourceMappingURL=server.js.map