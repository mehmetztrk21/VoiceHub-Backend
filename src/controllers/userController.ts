import { Post } from "../models/post";
import { User } from "../models/user";
import { ResponseFormat } from "../types/responseFormat";
var ObjectId = require('mongoose').Types.ObjectId;

export const addPost = async (req: any, res: any) => {
    const file = req.file;
    console.log(file);
    const user = await User.findById({ _id: new ObjectId("63e94101a829b8c660579c1c") });
    const post = new Post({ content: file.filename, userId: user });
    const record = await post.save();
    if (!record) {
        res.send(new ResponseFormat(null, "Failed", 400, false));
    }
    res.send(new ResponseFormat(record, "Success", 200, true));
}

export const getPosts = async (req: any, res: any) => {
    const posts = await Post.find({ userId: new ObjectId(req.params.id) }).populate("userId").setOptions({ strictPopulate: false }).select("-__v");
    res.send(new ResponseFormat(posts, "Success", 200, true));
}