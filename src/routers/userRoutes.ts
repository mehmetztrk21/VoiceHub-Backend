import { Router } from "express";
import { addPost, getPosts } from "../controllers/userController";
import { multerSettings } from "../utils/settings";


export const router = Router();

router.post("/add-post", multerSettings().single('file'), addPost);

router.get("/get-posts/:id", getPosts);