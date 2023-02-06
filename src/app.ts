import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import { router as adminRoutes } from "./routers/adminRoutes";
import getSettings from "./utils/settings";
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(async (req, res, next) => {
    await getSettings(app);
    console.log("In the middleware");
    next();
});

app.use("/admin", adminRoutes);

mongoose.connect("mongodb://0.0.0.0:27017/test").then(result => {
    console.log("Connected to DB");
    app.listen(3000);
}).catch(err => {
    console.log(err);
});


