import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    userId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    const response = new ApiResponse();
    //get user followers
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    let user = null;
    if (body.userId) user = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.userId) });
    else user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    const followings = await mongoDb.collection("users").aggregate([
        {
            $match: {
                $and: [
                    { status: "active" },
                    { isDeleted: false },
                    { $or: [{ _id: { $in: user.followings } }] }
                ]
            }
        },
        {
            $project: {
                "createdBy.password": 0,
                "createdBy.profilePhotoInfo": 0,
                "createdBy.descriptionVoiceInfo": 0,
                "contentInfo": 0,
                "createdBy.posts": 0,
                "createdBy.followers": 0,
                "createdBy.followings": 0,
                "createdBy.savedPosts": 0,
            },
        },
        {
            $sort: { createdAt: -1 }
        },

    ]).toArray();
    return response.setSuccess(followings);

}
