import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    id: string;
}
export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<Request>) {
    const response = new ApiResponse();
    const mongoDb = voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const comment = await mongoDb.collection("comments").findOne({ $and: [{ _id: new ObjectId(body.id) }, { createdBy: new ObjectId(resolved["_id"]) }, {isDeleted:false}] });
    if (comment) {
        const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
        if (user) {
            const comments = await mongoDb.collection("comments").updateOne({ _id: new ObjectId(body.id) }, { $set: { isDeleted: true } });
            return response.setSuccess(comments);
        }
        else {
            return response.setError("Unauthorized");
        }
    }
    else {
        return response.setError("Not Found");
    }
}