import { ApiResponse } from "fastapi-next";
import jsonwebtoken from "jsonwebtoken";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
export default async function ({ session, jwt, req,voiceHubDb }: AppContext) {
    const mongoDb = voiceHubDb.db("voiceHub");
    const response = new ApiResponse(false, "Error");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    await mongoDb.collection("loginLogs").updateOne({ token: req.headers.authorization.split(" ")[1] }, { $set: { tokenStatus: "passive", updatedAt: new Date() } })
    jsonwebtoken.sign({ _id: resolved["_id"] }, jwt.secret, { expiresIn: "0s" });
    return response.setSuccess("Logged out");
}