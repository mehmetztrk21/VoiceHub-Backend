import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    chatId: string;
}
export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    //delete chat
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const chat = await mongoDb.collection("chats").findOne({ _id: new ObjectId(body.chatId) });
    if (!chat) return response.setError("Chat not found");
    if (chat.senderId.toString() == user._id.toString()) {
        await mongoDb.collection("chats").updateOne({ _id: new ObjectId(body.chatId) }, { $set: { isDeletedforSender: true } });
        return response.setSuccess("Chat deleted");
    }
    else if (chat.receiverId.toString() == user._id.toString()) {
        await mongoDb.collection("chats").updateOne({ _id: new ObjectId(body.chatId) }, { $set: { isDeletedforReceiver: true } });
        return response.setSuccess("Chat deleted");
    }
    return response.setError("Unauthorized");
}