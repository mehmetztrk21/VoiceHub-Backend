import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { mappingChat } from "../../models/chat";
import { mappingMessage } from "../../models/message";
import { resolveToken } from "../../utils/resolveToken";
import { writeFile } from "../../utils/writeFile";

interface Request {
    receiverId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    //send message to user
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const receiver = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.receiverId) });
        if (receiver) {
            const objectId = new ObjectId();
            let message;
            if (Array.isArray(req.files)) {
                message = req.files.find(f => f.fieldname == "message");
            }
            if (message && message.mimetype.includes("audio")) {
                const messageUrl = `public/voices/${objectId + "_message." + message.mimetype.split("/")[1]}`;
                await writeFile(messageUrl, message.buffer).then(() => {
                    body.messageUrl = messageUrl;
                    delete message.buffer;
                    body.messageInfo = message;
                    console.log("File saved");
                }).catch((err) => {
                    console.log(err);
                });
            }


            const chat = await mongoDb.collection("chats").findOne({ $or: [{ $and: [{ senderId: user._id }, { receiverId: receiver._id }] }, { $and: [{ senderId: receiver._id }, { receiverId: user._id }] }] });
            if (chat) {
                let mapMessage = mappingMessage({ senderId: user._id, receiverId: receiver._id, messageUrl: body.messageUrl, messageInfo: body.messageInfo, chatId: chat._id });
                const newMessage = await mongoDb.collection("messages").insertOne({ ...mapMessage, _id: objectId });
                if (newMessage) {
                    return response.setSuccess(newMessage);
                }
            }
            else //create new chat
            {
                let mapChat = mappingChat({ senderId: user._id, receiverId: receiver._id });
                const newChat = await mongoDb.collection("chats").insertOne(mapChat);
                let mapMessage = mappingMessage({ senderId: user._id, receiverId: receiver._id, messageUrl: body.messageUrl, messageInfo: body.messageInfo, chatId: newChat.insertedId });
                const newMessage = await mongoDb.collection("messages").insertOne({ ...mapMessage, _id: objectId });
                if (newMessage) {
                    return response.setSuccess(newMessage);
                }
            }

        }
        return response.setError("Receiver not found");
    }
    return response.setError("Unauthorized");
}
