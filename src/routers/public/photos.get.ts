import { AppContext } from "../../AppContext";


export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<any>) {
    const imageUrl= req.query;
    console.log(imageUrl);
    return imageUrl;
}