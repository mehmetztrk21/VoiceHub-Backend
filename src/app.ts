import express from "express";
import { router as adminRoutes } from "./routers/adminRoutes";
import getSettings from "./utils/settings";

const app = express();

getSettings(app);

app.use("/admin", adminRoutes);

app.listen(3000, () => {
    console.log("Server started on port 3000");
});