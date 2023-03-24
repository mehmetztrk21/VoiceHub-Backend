import { ObjectId } from "mongodb";

export class Comment {
    _id: ObjectId;
    postId: ObjectId;
    contentUrl: string;
    contentInfo: any;
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const mappingComment= (body: any) => {
  let comment = new Comment();
    comment.postId = new ObjectId(body.postId);
    comment.contentUrl = body.contentUrl;
    comment.contentInfo = body.contentInfo;
    comment.createdAt = new Date();
    comment.updatedAt = new Date();
    comment.createdBy = new ObjectId(body.createdBy);
    return comment;
}