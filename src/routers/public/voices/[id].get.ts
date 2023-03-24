import { ApiResponse, NextRouteResponse, NextRouteResponseStatus } from "fastapi-next";
import { AppContext } from "../../../AppContext";
import { readFile } from "../../../utils/writeFile";


export default async function ({ req }: AppContext<any>) {
    const response = new ApiResponse();
    const voiceUrl = req.params;
    const { id } = voiceUrl;
    let voice;
    await readFile(`public/voices/${id}`, 'base64').then((data) => {
        voice = data;
    }).catch((err) => {
        console.log(err);
    });
    if(!voice) return response.setError("Voice not found");
    const buffer = Buffer.from(voice, 'base64');
    return new NextRouteResponse(NextRouteResponseStatus.OK, buffer, true, { 'Content-Type': 'image/mpeg' });
}