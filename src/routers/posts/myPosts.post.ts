import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import jsonwebtoken from "jsonwebtoken";
export default async function ({ body, voiceHubDb, req, session }: AppContext<any>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolveToken = jsonwebtoken.decode(req.headers.authorization.split(" ")[1])
    if(!resolveToken) return response.setError("Unauthorized")

    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolveToken["_id"]) });
    if (user) {
        const posts = await mongoDb.collection("posts").find({ userId: new ObjectId(user._id) }).toArray();
        return response.setSuccess(posts);
    }
    else {
        return response.setError("Unauthorized");
    }

}