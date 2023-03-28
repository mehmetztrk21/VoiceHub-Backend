import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    postId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const post = await mongoDb.collection("posts").findOne({ _id: new ObjectId(body.postId) });
        if (post) {
            const isSaved = user.savedPosts?.includes(post._id);
            if (isSaved) {
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $pull: { savedPosts: post._id } });
                return response.setSuccess("Post saved successfully");
            } else {
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $push: { savedPosts: post._id } });
                return response.setSuccess("Post unsaved successfully");
            }
        } else {
            return response.setError("Post not found");
        }
    } else {
        return response.setError("Unauthorized");
    }
}