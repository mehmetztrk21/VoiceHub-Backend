import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";

interface Request {
    search: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {

    //search user by username or name or surname
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const users = await mongoDb.collection("users").aggregate([
            {
                $match: {
                    $and: [
                        { isDeleted: false },
                        { status: "active" },
                        {
                            $or: [
                                { username: { $regex: body.search, $options: "i" } },
                                { name: { $regex: body.search, $options: "i" } },
                                { surname: { $regex: body.search, $options: "i" } },
                            ]
                        },
                        { _id: { $nin: user.blockedUsers } }
                    ]
                }
            },
            {
                $sort: { followers: -1 }
            },
            {
                $project: {
                    "password": 0,
                    "profilePhotoInfo": 0,
                    "descriptionVoiceInfo": 0,
                    "posts": 0
                }
            },

        ]).toArray();
        return response.setSuccess(users);
    }
    return response.setError("Unauthorized");
}

