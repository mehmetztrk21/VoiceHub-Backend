import { ApiResponse } from "fastapi-next";
import md5 from "md5";
import { ObjectId } from "mongodb";
import * as yup from "yup";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    oldPassword: string;
    newPassword: string;
}

export const validate = yup.object().shape({
    oldPassword: yup.string().required(),
    newPassword: yup.string().required().min(3)
});

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    const response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    if (user.password !== md5(body.oldPassword)) return response.setError("Old password is incorrect");
    await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $set: { password: md5(body.newPassword) } });
    return response.setSuccess("Password changed successfully");
}