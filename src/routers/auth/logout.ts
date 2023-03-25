import { ApiResponse } from "fastapi-next";
import jsonwebtoken from "jsonwebtoken";
import { AppContext } from "../../AppContext";
import { resolveToken } from "../../utils/resolveToken";
export default async function ({ session, jwt, req }: AppContext) {
    const response = new ApiResponse(false, "Error");
    const resolved = await resolveToken(req);
    if (!resolved) return response.setError("Unauthorized");
    jsonwebtoken.sign({ _id: resolved["_id"] }, jwt.secret, { expiresIn: "0s" });
    return response.setSuccess("Logged out");
}