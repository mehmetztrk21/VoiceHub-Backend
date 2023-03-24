import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

export default async function ({ body, voiceHubDb, req, session }: AppContext<any>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const savedPostIds = user.savedPosts.map(id => new ObjectId(id));
        const savedPosts = await mongoDb.collection("posts")
            .aggregate([
                { $match: { _id: { $in: savedPostIds } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "createdBy"
                    }
                },
                { $unwind: "$createdBy" },
                {
                    $project: {
                        "createdBy.password": 0,
                        "createdBy.profilePhotoInfo": 0,
                        "createdBy.descriptionVoiceInfo": 0    
                    }
                }
            ])
            .toArray();

        return response.setSuccess(savedPosts);
    }

    else {
        return response.setError("Unauthorized");
    }

}