import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface deletePostRequest {
    id: string;
}

export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<deletePostRequest>) {
    const response = new ApiResponse();
    const mongoDb = voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const post = await mongoDb.collection("posts").findOne({ $and: [{ _id: new ObjectId(body.id) }, { createdBy: new ObjectId(resolved["_id"]) }] });
    if (post) {
        const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
        if (user) {
            const posts = await mongoDb.collection("posts").updateOne({ _id: new ObjectId(body.id) }, { $set: { isDeleted: true } });
            return response.setSuccess(posts);
        }
        else {
            return response.setError("Unauthorized");
        }
    }
    else {
        return response.setError("Not Found");
    }
}
