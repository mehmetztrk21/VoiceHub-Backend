import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    isArchived: boolean;
    userId: string;
}
export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    let user = null;
    if (body.userId) user = await mongoDb.collection("users").findOne({ _id: new ObjectId(body.userId) });
    else user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) }); if (user) {
        const posts = await mongoDb.collection("posts").aggregate([
            {
                $match: {
                    $and: [
                        { createdBy: new ObjectId(user._id) },
                        { status: !body.isArchived ? "active" : "passive" },
                        { isDeleted: false }
                    ]
                }
            },
            {
                $lookup: {
                    from: "comments",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$postId", "$$postId"] },
                                        { $eq: ["$isDeleted", false] }
                                    ]
                                }
                            }
                        },
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
                                "createdBy.descriptionVoiceInfo": 0,
                                "contentInfo": 0
                            },
                        }, {
                            $sort: { createdAt: -1 }
                        }
                    ],
                    as: "comments"
                }
            },
            {
                $project: {
                    "comments.contentInfo": 0,
                    "contentInfo": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]).toArray();



        return response.setSuccess(posts);
    }
    else {
        return response.setError("Unauthorized");
    }

}