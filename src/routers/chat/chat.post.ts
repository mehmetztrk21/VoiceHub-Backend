import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    chatId: string;
}
export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    //get chat messages
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const chat = await mongoDb.collection("chats").findOne({
        $and: [
            { isDeleted: false },
            { status: "active" },
            {
                $or: [
                    {
                        $and: [
                            { senderId: new ObjectId(user._id) },
                            { isDeletedforSender: false },
                            { _id: new ObjectId(body.chatId) }
                        ]
                    }, {
                        $and: [
                            { receiverId: new ObjectId(user._id) },
                            { isDeletedforReceiver: false },
                            { _id: new ObjectId(body.chatId) }
                        ]
                    }
                ]
            },
            { _id: new ObjectId(body.chatId) }
        ]
    });
    if (!chat) return response.setError("Unauthorized");
    const messages = await mongoDb.collection("messages").aggregate([
        {
            $match: {
                $and: [
                    { isDeleted: false },
                    { status: "active" },
                    { chatId: new ObjectId(body.chatId) }
                ]
            }
        },
        {
            $sort: { createdAt: 1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "sender"
            }
        },
        {
            $unwind: "$sender"
        },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiver"
        }
        },
        {
            $unwind: "$receiver"
        },
        {
            $project: {
                "sender.password": 0,
                "sender.profilePhotoInfo": 0,
                "sender.descriptionVoiceInfo": 0,
                "sender.posts": 0,
                "sender.followers": 0,
                "sender.followings": 0,
                "receiver.password": 0,
                "receiver.profilePhotoInfo": 0,
                "receiver.descriptionVoiceInfo": 0,
                "receiver.posts": 0,
                "receiver.followers": 0,
                "receiver.followings": 0,
            }
        }
    ]).toArray();
    return response.setSuccess(messages);
}

