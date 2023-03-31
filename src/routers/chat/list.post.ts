import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    //user chat list with last message (chat and message collection)
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const chats = await mongoDb.collection("chats").aggregate([
        {
            $match: {
                $and: [
                    { isDeleted: false },
                    { status: "active" },
                    {
                        $or: [
                            {
                                $and: [
                                    { senderId: new ObjectId(user._id) },
                                    { isDeletedforSender: false }
                                ]
                            }, {
                                $and: [
                                    { receiverId: new ObjectId(user._id) },
                                    { isDeletedforReceiver: false }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "messages",
                let: { chatId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$chatId", "$$chatId"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: "lastMessage"
            }
        },
        {
            $unwind: "$lastMessage"
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "user1"
            }
        },
        {
            $unwind: "$user1"
        },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "user2"
            }
        },
        {
            $unwind: "$user2"
        },
        {
            $project: {
                "user1.password": 0,
                "user1.profilePhotoInfo": 0,
                "user1.descriptionVoiceInfo": 0,
                "user1.posts": 0,
                "user2.password": 0,
                "user2.profilePhotoInfo": 0,
                "user2.descriptionVoiceInfo": 0,
                "user2.posts": 0,
                "lastMessage.messageInfo": 0,
            }
        },
        {
            $sort: { "lastMessage.createdAt": -1 }
        }
    ]).toArray();
    return response.setSuccess(chats);
}



