import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import * as yup from 'yup';
import { AppContext } from "../../AppContext";
import { mappingUser } from "../../models/user";
import { writeFile } from "../../utils/writeFile";
interface ReqisterBody {
    name: string;
    surname: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    birthDay: string;
    gender: string;
    countryId: number;
    profilePhotoUrl: string;
    descriptionVoiceUrl: string;
    isSecretAccount: boolean;
}

export const validate = yup.object().shape({
    username: yup.string().required().min(3),
    password: yup.string().required().min(3),
    email: yup.string().required().email(),
});

export default async function ({ body, voiceHubDb, req }: AppContext<ReqisterBody>) {
    var response = new ApiResponse();
    const mongoDb =  voiceHubDb.db("voiceHub");
    const existsUser = await mongoDb.collection("users").findOne({ $or: [{ username: body.username }, { email: body.email }] });
    if (existsUser) {
        return response.setError("Email or Username is already exists");
    }
    const objectId = new ObjectId();
    let profilePhoto, descriptionVoice;
    if (Array.isArray(req.files)) {
        profilePhoto = req.files.find(f => f.fieldname == "profilePhoto");
        descriptionVoice = req.files.find(f => f.fieldname == "descriptionVoice");
    }
    if (profilePhoto && profilePhoto.mimetype.includes("image")) {
        const profilePhotoUrl = `public/photos/${objectId + "_profilePhoto." + profilePhoto.mimetype.split("/")[1]}`;
        await writeFile(profilePhotoUrl, profilePhoto.buffer).then(() => {
            body.profilePhotoUrl = profilePhotoUrl;
            delete profilePhoto.buffer;
            body.profilePhotoInfo = profilePhoto;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }
    if (descriptionVoice && descriptionVoice.mimetype.includes("audio")) {
        const descriptionVoiceUrl = `public/voices/${objectId + "_descriptionVoice." + descriptionVoice.mimetype.split("/")[1]}`;
        await writeFile(descriptionVoiceUrl, descriptionVoice.buffer).then(() => {
            delete descriptionVoice.buffer;
            body.descriptionVoiceUrl = descriptionVoiceUrl;
            body.descriptionVoiceInfo = descriptionVoice;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }

    let user = mappingUser(body);
    const result = await mongoDb.collection("users").insertOne({ ...user, _id: objectId });
    if (result) {
        let savedUser = await mongoDb.collection("users").findOne({ _id: objectId });
        savedUser = { ...savedUser, password: undefined };
        return response.setSuccess(savedUser, "User created");
    }
    return response.setError("User not created");
}
