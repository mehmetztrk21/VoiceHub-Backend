import { Router } from "express";
import { addUser, getUsers } from "../controllers/adminControllers";

export const router = Router();

const users: any[] = [{ name: "John Doe", age: 30 }, { name: "Jane Doe", age: 25 }]

router.get("/get-users", getUsers);

router.post("/add-user", addUser);
