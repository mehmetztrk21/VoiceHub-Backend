import jsonwebtoken from "jsonwebtoken";
export const resolveToken = (req: any) => {
    const resolveToken = jsonwebtoken.decode(req.headers.authorization.split(" ")[1])
    if (!resolveToken) return null
    return resolveToken;
}