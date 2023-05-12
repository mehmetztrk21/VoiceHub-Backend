import { ApiResponse } from "fastapi-next";
import jsonwebtoken from "jsonwebtoken";
import md5 from 'md5';
import { AppContext } from "../../AppContext";

interface Request {
    username: string;
    password: string;
}
export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<Request>) {
    const mongoDb = voiceHubDb.db("voiceHub");
    const user = await mongoDb.collection("users").findOne({
        $and: [{ username: body.username }, {
            password: md5(body.password)
        }]
    },
        { projection: { password: 0, descriptionVoiceInfo: 0, profilePhotoInfo: 0 } });
    if (user) {
        let reActive = false;
        const generatedToken = jsonwebtoken.sign({ _id: user._id }, jwt.secret, { expiresIn: "100y" });
        session.granted = true;
        session.token = generatedToken;
        session.user = user;
        if (user.status === "passive") {
            reActive = true;
            await mongoDb.collection("users").updateOne({ _id: user._id }, { $set: { status: "active" } });
            await mongoDb.collection("users").updateMany({ _id: { $in: user.followers } }, { $push: { followings: user._id } as any });
            await mongoDb.collection("users").updateMany({ _id: { $in: user.followings } }, { $push: { followers: user._id } as any });
        }
        await mongoDb.collection("loginLogs").insertOne({
            userId: user._id,
            token: generatedToken,
            tokenStatus: "active",
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return new ApiResponse().setSuccess({
            accessToken: generatedToken,
            user: {
                ...user,
                reActive: reActive ?? undefined
            },
        });
    }
    else {
        return new ApiResponse().setError("Unauthorized");
    }
}
