import * as Http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";
import * as Mongo from "mongodb";

// Database
let databaseUrl: string = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(databaseUrl, options);
async function connecttoDatabase(): Promise<void> {
    await mongoClient.connect();
    // console.log(await mongoClient.db("memory").collection("cards").find().toArray());

}

// Http Requests
let server: Http.Server = Http.createServer();
let port: string | number | undefined = process.env.PORT;
if (port === undefined) {
    port = 8100;
}
server.addListener("request", handleRequests);
server.listen(port);

async function handleRequests(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
    let currentUrl: url.UrlWithParsedQuery = url.parse(_request.url, true);
    console.log(currentUrl.query);
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.write("Die Daten wurden an den Server übertragen.");
}
connecttoDatabase();

