import mongoose from "mongoose";


const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    content: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

export const Post = mongoose.model("Post", postSchema);
