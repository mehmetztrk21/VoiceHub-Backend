import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    userId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const followedUser = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.userId) });
        if (followedUser) {
            const isFollowing = user.following?.includes(followedUser._id);
            if (isFollowing) {
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $pull: { following: followedUser._id } });
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(followedUser._id) }, { $pull: { followers: user._id } });
                return response.setSuccess("Unfollowed successfully");
            } else {
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $push: { following: followedUser._id } });
                await mongoDb.collection("users").updateOne({ _id: new ObjectId(followedUser._id) }, { $push: { followers: user._id } });
                return response.setSuccess("Followed successfully");
            }
        } else {
            return response.setError("User not found");
        }
    } else {
        return response.setError("Unauthorized");
    }
}