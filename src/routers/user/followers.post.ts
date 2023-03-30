import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    userId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    const response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    let user = null;
    if (body.userId) user = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.userId) });
    else user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    const followers = await mongoDb.collection("users").aggregate([
        {
            $match: {
                $and: [
                    { status: "active" },
                    { isDeleted: false },
                    { $or: [{ _id: { $in: user.followers } }] }
                ]
            }
        },
        {
            $project: {
                "password": 0,
                "profilePhotoInfo": 0,
                "descriptionVoiceInfo": 0,
                "contentInfo": 0,
                "posts": 0,
                "followers": 0,
                "followings": 0,
                "savedPosts": 0,
            },
        },
        {
            $sort: { createdAt: -1 }
        },

    ]).toArray();
    return response.setSuccess(followers);

}
