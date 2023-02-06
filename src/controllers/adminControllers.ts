import { Request, Response } from "express";
import { User } from "../models/user";
import { ResponseFormat } from "../types/responseFormat";
import { IUser } from "../types/userTypes";
export const addUser = async (req: any, res: any) => {
    const reqUser = req.body as IUser;
    const user = new User(reqUser);
    const record = await user.save();
    if (!record) {
        res.send(new ResponseFormat(null, "Failed", 400, false));
    }
    res.send(new ResponseFormat(record, "Success", 200, true));
};

export const getUsers = async (req: Request, res: Response) => {
    const users = await User.find().select("-__v");
    res.send(new ResponseFormat(users, "Success", 200, true));
}

export const saveVoice = async (req: Request, res: Response) => {
    res.send(new ResponseFormat(req.file, "Success", 200, true));
}
