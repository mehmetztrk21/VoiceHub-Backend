import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { mappingPost } from "../../models/post";
import { resolveToken } from "../../utils/resolveToken";
import { writeFile } from "../../utils/writeFile";

interface createPost {
    Categories: string[];
    ContentUrl: string;
}

export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<createPost>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");

    const objectId = new ObjectId();
    let content;
    if (Array.isArray(req.files)) {
        content = req.files.find(f => f.fieldname == "content");
    }
    if (body.categories) {
        let temp = [];
        temp.push(body.categories);
        body.categories = temp;
    }

    if (content && content.mimetype.includes("audio")) {
        const contentUrl = `public/voices/${objectId + "_content." + content.mimetype.split("/")[1]}`;
        await writeFile(contentUrl, content.buffer).then(() => {
            body.contentUrl = contentUrl;
            delete content.buffer;
            body.contentInfo = content;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }
    const post = mappingPost({ ...body, createdBy: resolved["_id"] })
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        await mongoDb.collection("posts").insertOne({ ...post, _id: objectId });
        await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $push: { posts: objectId } });
        const posts = await mongoDb.collection("posts").find({ createdBy: new ObjectId(resolved["_id"]) }).toArray();
        return response.setSuccess(posts);
    }
    return response.setError("User not found");
}
