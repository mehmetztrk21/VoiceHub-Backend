import { Request, Response } from "express";
import { User } from "../models/user";

const users: User[] = [{ name: "John Doe", age: 30 }, { name: "Jane Doe", age: 25 }];

export const addUser = async (req: Request, res: Response) => {
    const { name, age } = req.body;
    const user = new User({ name, age });
    users.push(user);
    res.send({ data: user, message: "Success", status: 200 });
};

export const getUsers = async (req: Request, res: Response) => {
    res.send({ data: users, message: "Success", status: 200 });
}
