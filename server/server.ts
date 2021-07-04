import * as Http from "http";
import * as url from "url";
import * as Mongo from "mongodb";

namespace Server {
    interface CardDbData {
    _id: string;
    link: string;
    }
    interface Card {
    id: string;
    link: string;
    }

    // Add new Cards
    let addNewCardsAllowed: boolean = false;
    let cards: Card[] = [];

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
    let databaseUrl: string = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
    let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(databaseUrl, options);
    
    async function connecttoDatabase(): Promise<void> {
        await mongoClient.connect();
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 9) {
                addNewCardsAllowed = true;
            }
        });

        
    }
    connecttoDatabase(); 
    
    // DB functions
    async function loadCardsFromDbReturnLength(): Promise<number> {
        let cardLinks: CardDbData[] = await mongoClient.db("memory").collection("cards").find().toArray();
        cards = [];
        for (const i of cardLinks) {
            cards.push(linkToCard(i.link));
        }
        return cards.length;
    }
    function deleteByLinkFromDb(_link: string): void {
        mongoClient.db("memory").collection("cards").findOneAndDelete({link: _link});
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 9) {
                addNewCardsAllowed = true;
            } else {
                addNewCardsAllowed = false;
            }
        });
    }
    function addByLinkToDb(_link: string): void {
        mongoClient.db("memory").collection("cards").insertOne({link: _link});
        loadCardsFromDbReturnLength().then((data) => {
            if (data < 8) {
                addNewCardsAllowed = true;
            } else {
                addNewCardsAllowed = false;
            }
        });
    }
    // General Functions
    function linkToCard(_link: string, _id?: string): Card {
        let card: Card = {id: _id, link: _link};
        return card;
    }
    
    
}
