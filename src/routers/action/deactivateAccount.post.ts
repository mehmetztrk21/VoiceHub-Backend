import { ApiResponse } from "fastapi-next";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

export default async function ({ body, voiceHubDb, req, session, jwt }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { status: "passive" } });
    await mongoDb.collection("users").updateMany({ _id: { $in: user.followers } }, { $pull: { followings: user._id } as any });
    await mongoDb.collection("users").updateMany({ _id: { $in: user.followings } }, { $pull: { followers: user._id } as any });
    //  deactive current token jsonwebtoken
    await mongoDb.collection("loginLogs").updateMany({ userId: new ObjectId(user._id) }, { $set: { tokenStatus: "passive", updatedAt: new Date() } })
    jsonwebtoken.sign({ _id: user._id }, jwt.secret, { expiresIn: "0s" });
    return response.setSuccess("Account deactivated successfully");
}