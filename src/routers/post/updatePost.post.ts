import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    id: string;
    categories: string[];
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const post = await mongoDb.collection("posts").findOne({ $and: [{ _id: new ObjectId(body.id) }, { createdBy: new ObjectId(resolved["_id"]) }, { isDeleted: false }] });
    if (!post) return response.setError("Not Found");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const posts = await mongoDb.collection("posts").updateOne({ _id: new ObjectId(body.id) }, { $set: { categories: body.categories } });
        return response.setSuccess(posts);
    }
    else {
        return response.setError("Unauthorized");
    }

}