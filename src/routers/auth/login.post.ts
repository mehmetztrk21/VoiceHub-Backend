import { ApiResponse } from "fastapi-next";
import md5 from 'md5';
import * as yup from 'yup';
import { AppContext } from "../../AppContext";
import jsonwebtoken from "jsonwebtoken";
import { getConfig } from "../../Config";
export const validate = yup.object().shape({
    username: yup.string().required().min(3),
    password: yup.string().required().min(3)
});

export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<any>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const user = await mongoDb.collection("users").findOne({ $and: [{ username: body.username }, { password: md5(body.password) }] });
    if (user) {
        const generatedToken = await jsonwebtoken.sign({ _id: user._id }, jwt.secret, { expiresIn: "100y"  });
        session.granted = true;
        session.token = generatedToken;
        session.user = user;
        return new ApiResponse().setSuccess({
            accessToken: generatedToken
        });
    }
    else {
        return new ApiResponse().setError("Unauthorized");
    }
}
