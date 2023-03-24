import { ObjectId } from "mongodb";

export class Post {
    _id: ObjectId;
    categories: string[];
    contentUrl: string;
    contentInfo: any;
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    likes: ObjectId[];
    isDeleted: boolean;
    status: string;
}

export const mappingPost= (body: any) => {
  let post = new Post();
    post.categories = body.categories;
    post.contentUrl = body.contentUrl;
    post.contentInfo = body.contentInfo;
    post.createdAt = new Date();
    post.updatedAt = new Date();
    post.createdBy = new ObjectId(body.createdBy);
    post.likes = [];
    post.isDeleted = false;
    post.status = "active";
    return post;
}