import { ObjectId } from "mongodb";

export class Chat {
    _id: ObjectId;
    senderId: ObjectId;
    receiverId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isDeletedforSender: boolean;
    isDeletedforReceiver: boolean;
}

export const mappingChat = (body: any) => {
    let chat = new Chat();
    chat.senderId = new ObjectId(body.senderId);
    chat.receiverId = new ObjectId(body.receiverId);
    chat.createdAt = new Date();
    chat.updatedAt = new Date();
    chat.isDeletedforSender = false;
    chat.isDeletedforReceiver = false;
    return chat;
}