import { ObjectId } from "mongodb";

export class Message {
    _id: ObjectId;
    chatId: ObjectId;
    senderId: ObjectId;
    receiverId: ObjectId;
    messageInfo: any;
    messageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    isRead: boolean;
}

export const mappingMessage = (body: any) => {
    let message = new Message();
    message.chatId = new ObjectId(body.chatId);
    message.senderId = new ObjectId(body.senderId);
    message.receiverId = new ObjectId(body.receiverId);
    message.messageUrl = body.messageUrl;
    message.messageInfo = body.messageInfo;
    message.createdAt = new Date();
    message.updatedAt = new Date();
    message.isDeleted = false;
    message.isRead = false;
    return message;
}