import mongoose from "mongoose";


const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
    name: string;
    age: number;
}

const userSchema = new Schema({
    name: String,
    age: Number
});

export const User = mongoose.model("User", userSchema);