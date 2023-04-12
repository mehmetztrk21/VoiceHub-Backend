import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("Unauthorized");
    const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Calculate past week date
    const topCategories = await mongoDb.collection("posts")
        .aggregate([
            { $match: { createdAt: { $gte: pastWeek } } }, // Filter posts created in past week
            { $unwind: "$categories" }, // Split categories array into multiple documents
            { $group: { _id: "$categories", count: { $sum: 1 } } }, // Group by category and count the occurrences
            { $sort: { count: -1 } }, // Sort by count in descending order
            { $limit: 20 } // Return only top 20 categories
        ])
        .toArray();
    return response.setSuccess(topCategories);
}
