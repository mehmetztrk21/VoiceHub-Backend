// import { ObjectId } from "mongodb";

// export class Notification {
//     _id: ObjectId;
//     userId: ObjectId;
//     type: string;
//     message: string;
//     by: ObjectId;
//     postId: ObjectId;
//     createdAt: Date;
//     updatedAt: Date;
//     isRead: boolean;
//     isDeleted: boolean;
// }

// export const mappingChat = (body: any) => {
//     let chat = new Notification();
//     chat.senderId = new ObjectId(body.senderId);
//     chat.receiverId = new ObjectId(body.receiverId);
//     chat.createdAt = new Date();
//     chat.updatedAt = new Date();
//     chat.isDeletedforSender = false;
//     chat.isDeletedforReceiver = false;
//     return chat;
// }