import { ApiResponse } from "fastapi-next";
import md5 from "md5";
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
    if (user.blockedUsers?.includes(body.userId)) return response.setError("User already blocked");
    await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $push: { blockedUsers: blockedUser._id } });
    return response.setSuccess("User blocked successfully");
}