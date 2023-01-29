import express from "express";
import bodyParser from "body-parser";
import getSettings from "./utils/settings";

const users: any[] = [{ name: "John Doe", age: 30 }, { name: "Jane Doe", age: 25 }]

const app = express();

getSettings(app);

app.get("/", (req: any, res: any) => {

    res.send({ data: users, message: "Success", status: 200 });
});

app.post("/add-user", (req: any, res: any) => {
    const user = req.body;
    users.push(user);
    res.send({ data: users, message: "Success", status: 200 });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});