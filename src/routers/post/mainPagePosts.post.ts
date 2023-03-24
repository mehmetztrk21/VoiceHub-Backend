import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import * as yup from "yup";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
interface Request {
    page: number;
    limit: number;
}
export const validate = yup.object().shape({
    page: yup.number().required(),
    limit: yup.number().required()
});
export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const followingIds = user.followings?.map((id: string) => new ObjectId(id));

        const posts = await mongoDb.collection("posts").aggregate([
            {
                $match: {
                    $and: [
                        { createdBy: new ObjectId(user._id) },
                        { status: "active" },
                        { isDeleted: false },
                        { $or: [{ createdBy: { $in: followingIds } }, { createdBy: new ObjectId(user._id) }] }
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
            },
            {
                $sort: { createdAt: -1 }
            }
        ])
            .sort({ createdAt: -1 })
            .skip((body.page - 1) * body.limit)
            .limit(body.limit).toArray();
        return response.setSuccess(posts);
    }
    else {
        return response.setError("Unauthorized");
    }

}