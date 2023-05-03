import { ApiResponse, NextRouteResponse, NextRouteResponseStatus } from "fastapi-next";
import { AppContext } from "../../../AppContext";
import { readFile } from "../../../utils/writeFile";


export default async function ({ req }: AppContext<any>) {
    const response = new ApiResponse();
    const imageUrl = req.params;
    const { id } = imageUrl;
    let image;
    await readFile(`public/photos/${id}`, 'base64')
        .then((data) => {
            image = data;
        }).catch((err) => {
            console.log(err);
        });
    if (!image) return response.setError("Image not found");
    const buffer = Buffer.from(image, 'base64');
    return new NextRouteResponse(NextRouteResponseStatus.OK,
        buffer,
        true,
        { 'Content-Type': 'image/jpeg' });
}