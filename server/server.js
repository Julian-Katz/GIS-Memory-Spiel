"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const url = require("url");
const Mongo = require("mongodb");
// Database
let databaseUrl = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
let options = { useNewUrlParser: true, useUnifiedTopology: true };
let mongoClient = new Mongo.MongoClient(databaseUrl, options);
async function connecttoDatabase() {
    await mongoClient.connect();
    // console.log(await mongoClient.db("memory").collection("cards").find().toArray());
}
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
    console.log(currentUrl.query);
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.write("Die Daten wurden an den Server übertragen.");
}
connecttoDatabase();
//# sourceMappingURL=server.js.map