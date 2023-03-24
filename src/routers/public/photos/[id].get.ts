import { ApiResponse, NextRouteResponse, NextRouteResponseStatus } from "fastapi-next";
import { AppContext } from "../../../AppContext";
import { readFile } from "../../../utils/writeFile";


export default async function ({ req }: AppContext<any>) {
    const response = new ApiResponse()
    const imageUrl = req.params;
    const { id } = imageUrl;
    await readFile(`public/photos/${id}`, 'base64').then((data) => {
        response.setSuccess(data);
    }).catch((err) => {
        console.log(err);
    });
    const buffer = Buffer.from(response.data, 'base64');
    return new NextRouteResponse(NextRouteResponseStatus.OK, buffer, true, { 'Content-Type': 'image/jpeg' });
}