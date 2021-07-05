// application/json
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

    // Http Requests
    let server: Http.Server = Http.createServer();
    let port: string | number | undefined = process.env.PORT;
    if (port === undefined) {
        port = 8100;
    }
    server.addListener("request", handleRequests);
    server.listen(port);
    
    async function handleRequests(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        try {
        let currentUrl: url.UrlWithParsedQuery = url.parse(_request.url, true);
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
        } catch (error) {
            console.log(error);
        }
    }
    // Database
    let databaseUrl: string = "mongodb+srv://user:12345@gis-ist-geil.wwlee.mongodb.net/memory?retryWrites=true&w=majority";
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    async function connectDB(): Promise<void> {
        try {
            if (mongoClient.isConnected !) {
                await mongoClient.connect();
            }
        } catch (error) {
            console.log(error);
        }
    }
        
    // Database Get Data
    async function getCards(): Promise<Card[]> {
        await connectDB();
        let cards: Card[] = [];
        let cardLinks: CardDbData[] = await mongoClient.db("memory").collection("cards").find().toArray();
        for (const i of cardLinks) {
            cards.push(linkToCard(i.link, null));
        }
        return cards;
        }
    
    async function addNewCardsAllowed(): Promise<boolean> {
        await connectDB();
        if (await mongoClient.db("memory").collection("cards").countDocuments() < 8) {
            return true;
        } else {
            return false;
        }
    }
    // Database write Data
    async function deleteCardByLinkFromDb(_link: string): Promise<void> {
        await connectDB();
        mongoClient.db("memory").collection("cards").findOneAndDelete({link: _link});
    }
    async function addCardByLinkToDb(_link: string): Promise<string> {
        await connectDB();
        if (await addNewCardsAllowed()) {
            mongoClient.db("memory").collection("cards").insertOne({link: _link});
            return "Karte wurde hinzugefügt";
        } else {
            return "Maximal 8 Karten möglich";
        }
    }
    
    // General Functions
    function linkToCard(_link: string, _id: string): Card {
        let card: Card = {id: _id, link: _link};
        return card;
    }
    
}
