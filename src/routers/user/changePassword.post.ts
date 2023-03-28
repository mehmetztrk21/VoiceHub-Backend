import { ApiResponse } from "fastapi-next";
import md5 from "md5";
import { ObjectId } from "mongodb";
import * as yup from "yup";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    password: string;
    newPassword: string;
}
export const validate = yup.object().shape({
    password: yup.string().required(),
    newPassword: yup.string().required()
});
export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const isPasswordCorrect = md5(body.password) === user.password;
        if (isPasswordCorrect) {
            const hashedPassword = md5(body.newPassword);
            await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { password: hashedPassword } });
            return response.setSuccess("Password changed successfully");
        } else {
            return response.setError("Password is incorrect");
        }
    } else {
        return response.setError("Unauthorized");
    }
}