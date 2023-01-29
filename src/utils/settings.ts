import bodyParser from "body-parser";

export default async function getSettings(app: any) {
    app.use(bodyParser.json());
    app.use((req: any, res: any, next: any) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        next();
    });
}