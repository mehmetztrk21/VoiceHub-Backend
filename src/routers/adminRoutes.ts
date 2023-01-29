import { Router } from "express";
import { addUser, getUsers, saveVoice } from "../controllers/adminControllers";
import { multerSettings } from "../utils/settings";
export const router = Router();



router.get("/get-users", getUsers);

router.post("/add-user", addUser);

router.post("/save-voice", multerSettings().single('file'), saveVoice);
