import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
import { removeFile } from "../../utils/writeFile";

interface Request {
    type: string;  // "profilePhoto" | "descriptionVoice"
}

export default async function ({ body, voiceHubDb, req }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("User not found");
    if (body.type == "profilePhoto" && user.profilePhotoUrl){
        await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { profilePhotoUrl: undefined, profilePhotoInfo:undefined } });
        await removeFile(user.profilePhotoUrl).then(() => {
            console.log("File removed");
        }).catch((err) => {
            console.log(err);
        });
    }
    else if (body.type == "descriptionVoice" && user.descriptionVoiceUrl){
        await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { descriptionVoiceUrl: undefined, descriptionVoiceInfo:undefined } });
        await removeFile(user.descriptionVoiceUrl).then(() => {
            console.log("File removed");
        }).catch((err) => {
            console.log(err);
        });
    }
    else
        return response.setError("Invalid type or file not found");
    return response.setSuccess("Success");
}
