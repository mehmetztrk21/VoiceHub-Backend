import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
export default async function ({ body, voiceHubDb, req, session }: AppContext<any>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const posts = await mongoDb.collection("posts").find({ $and: [{ createdBy: new ObjectId(user._id) }, { status: "passive" }] }).toArray();
        return response.setSuccess(posts);
    }
    else {
        return response.setError("Unauthorized");
    }

}