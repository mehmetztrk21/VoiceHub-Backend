import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { mappingComment } from "../../models/comment";
import { resolveToken } from "../../utils/resolveToken";
import { writeFile } from "../../utils/writeFile";

interface Request {
    postId: string;
}

export default async function ({ body, voiceHubDb, req, session }: AppContext<Request>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");

    const objectId = new ObjectId();
    let content;
    if (Array.isArray(req.files)) {
        content = req.files.find(f => f.fieldname == "comment");
    }
    if (content && content.mimetype.includes("audio")) {
        const contentUrl = `public/voices/${objectId + "_comment." + content.mimetype.split("/")[1]}`;
        await writeFile(contentUrl, content.buffer).then(() => {
            body.contentUrl = contentUrl;
            delete content.buffer;
            body.contentInfo = content;
            console.log("File saved");
        }).catch((err) => {
            console.log(err);
        });
    }
    const comment = mappingComment({ ...body, createdBy: resolved["_id"] })
    const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
    if (user) {
        const result = await mongoDb.collection("comments").insertOne({...comment,_id:objectId});
        return response.setSuccess(result);
    }
    return response.setError("User not found");
}