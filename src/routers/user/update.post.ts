import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
import { writeFile } from "../../utils/writeFile";

interface Request {
    name: string;
    surname: string;
    username: string;
    phone: string;
    birthDay: string;
    gender: string;
    isSecretAccount: boolean;
    // profilePhoto: any; File olarak geliyor
    // descriptionVoice: any; File olarak geliyor
}

export default async function ({ body, voiceHubDb, req }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("User not found");
    let profilePhoto, descriptionVoice;
    if (Array.isArray(req.files)) {
        profilePhoto = req.files.find(f => f.fieldname == "profilePhoto");
        descriptionVoice = req.files.find(f => f.fieldname == "descriptionVoice");
    }
    if (profilePhoto && profilePhoto.mimetype.includes("image")) {
        const profilePhotoUrl = `public/photos/${resolved["_id"]}_profilePhoto.${profilePhoto.mimetype.split("/")[1]}`;
        await writeFile(profilePhotoUrl, profilePhoto.buffer).then(() => {
            body.profilePhotoUrl = profilePhotoUrl;
            delete profilePhoto.buffer;
            body.profilePhotoInfo = profilePhoto;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }
    if (descriptionVoice && (descriptionVoice.mimetype.includes("audio") || descriptionVoice.mimetype.includes("video")) ) {
        const descriptionVoiceUrl = `public/voices/${resolved["_id"] + "_descriptionVoice." + descriptionVoice.mimetype.split("/")[1]}`;
        await writeFile(descriptionVoiceUrl, descriptionVoice.buffer).then(() => {
            delete descriptionVoice.buffer;
            body.descriptionVoiceUrl = descriptionVoiceUrl;
            body.descriptionVoiceInfo = descriptionVoice;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }
    const result = await mongoDb.collection("users").updateOne({ _id: new ObjectId(user._id) }, {
        $set: {
            name: body.name || user.name,
            surname: body.surname || user.surname,
            username: body.username || user.username,
            phone: body.phone || user.phone,
            birthDay: body.birthDay || user.birthDay,
            gender: body.gender || user.gender,
            profilePhotoUrl: body.profilePhotoUrl || user.profilePhotoUrl,
            descriptionVoiceUrl: body.descriptionVoiceUrl || user.descriptionVoiceUrl,
            profilePhotoInfo: body.profilePhotoInfo || user.profilePhotoInfo,
            descriptionVoiceInfo: body.descriptionVoiceInfo || user.descriptionVoiceInfo,
            isSecretAccount: body.isSecretAccount || user.isSecretAccount,
        }
    });
    if (result) {
        response.setSuccess(result);
    }
    else {
        response.setError("Error");
    }
    return response;
}