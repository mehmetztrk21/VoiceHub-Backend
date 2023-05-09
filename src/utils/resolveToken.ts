import jsonwebtoken from "jsonwebtoken";
export const resolveToken = async (req: any, mongoDb: any) => {
    const resolveToken = jsonwebtoken.decode(req.headers.authorization.split(" ")[1])
    let isActive = await mongoDb.collection("loginLogs").findOne({ token: req.headers.authorization.split(" ")[1], tokenStatus: "active" });
    if (!resolveToken || !isActive) return false;
    return resolveToken;
}