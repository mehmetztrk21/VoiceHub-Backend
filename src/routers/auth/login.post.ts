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
        const generatedToken = jsonwebtoken.sign({ _id: user._id }, jwt.secret, { expiresIn: "100y" });
        session.granted = true;
        session.token = generatedToken;
        session.user = user;
        if (user.status === "passive")
            await mongoDb.collection("users").updateOne({ _id: user._id }, { $set: { status: "active" } });
        return new ApiResponse().setSuccess({
            accessToken: generatedToken,
            user: { ...user }
        });
    }
    else {
        return new ApiResponse().setError("Unauthorized");
    }
}
