import bodyParser from "body-parser";
import env from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { router as adminRoutes } from "./routers/adminRoutes";
import { router as userRoutes } from "./routers/userRoutes";
import getSettings from "./utils/settings";
const app = express();
env.config();
const MongoDbUrl = process.env.MongoDbUrl || "";

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json())

app.use(async (req, res, next) => {
    await getSettings(app);
    console.log("In the middleware");
    next();
});

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

mongoose.connect(MongoDbUrl).then(result => {
    console.log("Connected to DB");
    app.listen(3000);
}).catch(err => {
    console.log(err);
});


