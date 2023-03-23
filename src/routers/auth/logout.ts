import { ApiResponse } from "fastapi-next";
import { AppContext } from "../../AppContext";

export default async function (ctx: AppContext) {
    const response = new ApiResponse(false, "Error");
    if (ctx.session.granted) {
        ctx.session.granted = false;
        ctx.session.token = null;
        ctx.session.user = null;
        return response.setSuccess("Logged out");
    }
}