import mongoose from "mongoose";


const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    username:String,
    password: String,
    birthDay: Date,
    profilePhoto: String,
    description: String,
});

export const User = mongoose.model("User", userSchema);