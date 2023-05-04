import { ApiResponse } from "fastapi-next";
import { resolveToken } from "../../utils/resolveToken";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";


export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { status: "passive" } });
    return response.setSuccess("Account deactivated successfully");
}