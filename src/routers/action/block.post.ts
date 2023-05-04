import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import * as yup from "yup";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    userId: string;
}

export const validate = yup.object().shape({
    userId: yup.string().required(),
});

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    const response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const blockedUser = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.userId) });
    if (!blockedUser) return response.setError("User not found");
    const isBlocked = user.blockedUsers?.find((i: any) => i.toString() === blockedUser._id?.toString());
    if (isBlocked) {
        await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $pull: { blockedUsers: blockedUser._id } });
        return response.setSuccess("User unblocked successfully");
    }
    await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $push: { blockedUsers: blockedUser._id } });
    return response.setSuccess("User blocked successfully");
}