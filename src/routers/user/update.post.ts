import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
import { renameFile, writeFile } from "../../utils/writeFile";

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
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (!user) return response.setError("User not found");
    const isUsernameOrEmailExists = await mongoDb.collection("users").findOne({ $or: [{ username: body.username }, { email: body.email }] });
    if (isUsernameOrEmailExists) return response.setError("Username or email already exists");
    let profilePhoto, descriptionVoice;
    if (Array.isArray(req.files)) {
        profilePhoto = req.files.find(f => f.fieldname == "profilePhoto");
        descriptionVoice = req.files.find(f => f.fieldname == "descriptionVoice");
    }
    if (profilePhoto && profilePhoto.mimetype.includes("image")) {
        const profilePhotoUrl = `public/photos/${resolved["_id"] + uuidv4()}_profilePhoto.${profilePhoto.mimetype.split("/")[1]}`;
        await writeFile(profilePhotoUrl, profilePhoto.buffer).then(() => {
            delete profilePhoto.buffer;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
        await renameFile(user.profilePhotoUrl, profilePhotoUrl).then(() => {
            body.profilePhotoUrl = profilePhotoUrl;
            body.profilePhotoInfo = profilePhoto;
            console.log("File renamed");
        }).catch((err) => {
            console.log(err);
        });
    }
    if (descriptionVoice && (descriptionVoice.mimetype.includes("audio") || descriptionVoice.mimetype.includes("video"))) {
        const descriptionVoiceUrl = `public/voices/${resolved["_id"] + uuidv4() + "_descriptionVoice." + descriptionVoice.mimetype.split("/")[1]}`;
        await writeFile(user.descriptionVoiceUrl, descriptionVoice.buffer).then(() => {
            delete descriptionVoice.buffer;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
        await renameFile(user.descriptionVoiceUrl, descriptionVoiceUrl).then(() => {
            body.descriptionVoiceUrl = descriptionVoiceUrl;
            body.descriptionVoiceInfo = descriptionVoice;
            console.log("File renamed");
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