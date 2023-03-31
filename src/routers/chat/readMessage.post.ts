import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    messageId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    //read message if receiver
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const message = await mongoDb.collection("messages").findOne({ _id: new ObjectId(body.messageId) });
    if (!message) return response.setError("Message not found");
    if (message.receiverId.toString() != user._id.toString()) return response.setError("Unauthorized");
    await mongoDb.collection("messages").updateOne({ _id: new ObjectId(body.messageId) }, { $set: { isRead: true } });
    return response.setSuccess("Message read");
}