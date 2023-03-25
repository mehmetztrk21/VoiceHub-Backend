import md5 from "md5";
import moment from "moment";
import { ObjectId } from "mongodb";

export class User {
    _id: ObjectId;
    name: string;
    surname: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    birthDay: Date;
    gender: string;
    profilePhotoUrl: string;
    descriptionVoiceUrl: string;
    isSecretAccount: boolean;
    profilePhotoInfo: any;
    descriptionVoiceInfo: any;
    isTic: boolean;
    posts: ObjectId[];
    followers: ObjectId[];
    followings: ObjectId[];
    savedPosts: ObjectId[];
    status: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const mappingUser= (body: any) => {
    let user = new User();
    user.name = body.name;
    user.surname = body.surname;
    user.username = body.username;
    user.password = md5(body.password);
    user.email = body.email;
    user.phone = body.phone;
    user.birthDay = moment(body.birthDay).toDate();
    user.gender = body.gender;
    user.profilePhotoUrl = body.profilePhotoUrl;
    user.descriptionVoiceUrl = body.descriptionVoiceUrl;
    user.isSecretAccount = body.isSecretAccount == 1 ? true : false;
    user.profilePhotoInfo = body.profilePhotoInfo;
    user.descriptionVoiceInfo = body.descriptionVoiceInfo;
    user.isTic = false;
    user.posts = [];
    user.followers = [];
    user.followings = [];
    user.savedPosts = [];
    user.status = "active";
    user.isDeleted = false;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
}