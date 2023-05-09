import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    postId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const post = await mongoDb.collection("posts").findOne({ _id: new ObjectId(body.postId) });
    if (!post) return response.setError("Post not found");
    

await mongoDb.collection("posts").updateOne({ _id: new ObjectId(post._id) }, { $set: { isLikesVisible: !(post.isLikesVisible ?? true) } });


    return response.setSuccess("Success");
}
