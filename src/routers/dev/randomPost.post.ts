import { ApiResponse } from "fastapi-next";
import { ObjectId } from "mongodb";
import { AppContext } from "../../AppContext";
import { mappingPost } from "../../models/post";
import { resolveToken } from "../../utils/resolveToken";
import { writeFile } from "../../utils/writeFile";

interface createPost {
    ContentUrl: string;
}

export default async function ({ body, session, jwt, voiceHubDb, req }: AppContext<createPost>) {
    var response = new ApiResponse();
    const mongoDb = await voiceHubDb.db("voiceHub");
    const resolved = await resolveToken(req, mongoDb);
    if (!resolved) return response.setError("Unauthorized");
    const hastags = [
        "SosyalMedya",
        "Paylasim",
        "Trendler",
        "Gozde",
        "Influencer",
        "Yenilikler",
        "SosyalMedyaPazarlama",
        "Gundem",
        "DijitalDunya",
        "Etkilesim",
        "Yaratıcılık",
        "SosyalAğlar",
        "Viral",
        "TakipçiKazanma",
        "Strateji",
        "Iletisim",
        "KullanıcıDeneyimi",
        "Pazarlama",
        "TakipEt",
        "Takipci",
        "Icerik",
        "Yenilik",
        "Gelişim",
        "Reklam",
        "Marka",
        "YenilikciFikirler",
        "DijitalPazarlama",
        "Takip",
        "Yenilikci",
        "TakipciKazan",
        "Trend",
        "SosyalMedyaHesaplari",
        "Begeni",
        "Yaratıcı",
        "Etkilesimli",
        "Medya",
        "Sosyal",
        "IcerikPazarlama",
        "TakipEdin",
        "PazarlamaStratejisi",
        "Izleyici",
        "SosyalMedyaYonetimi",
        "HedefKitle",
        "Takipciler",
        "Paylas",
        "SosyalMedyaStratejisi",
        "Begen",
        "Takipcilerim",
        "Haberler",
        "IcerikYonetimi",
        "YaratıcıIcerik",
        "TakipciSayisi",
        "Instagram",
        "Facebook",
        "Twitter",
        "LinkedIn",
        "Snapchat",
        "YouTube",
        "Pinterest",
        "TikTok",
        "Reddit",
        "Tumblr",
        "Fenomen",
        "Moda",
        "Gezgin",
        "Teknoloji",
        "Yemek",
        "Muzik",
        "Sanat",
        "Spor",
        "Guzellik",
        "Eglence",
        "Film",
        "Kitap",
        "Saglik",
        "Fitness",
        "Blog",
        "Vlogger",
        "Podcast",
        "Girisim",
        "Meme",
        "Gozleme",
        "Diyet",
        "Kahve",
        "Giyim",
        "Seyahat",
        "Yoga",
        "Motivasyon",
        "Egitim",
        "Kultur",
        "Hayat",
        "Gelir",
        "Teknoloji",
        "Haber",
        "Gozluk",
        "Dekorasyon",
        "Ev",
        "Oyun",
        "Araba",
        "Motosiklet",
        "Gaming",
        "Otomobil",
        "Bilim",
        "Dogal",
        "Doga",
        "Turizm",
        "Tasarim"
    ];

    let content;
    let contents = [];
    if (Array.isArray(req.files)) {
        contents = req.files.filter(f => f.fieldname == "content");
    }
    let isError = false;
    for (const content of contents) {
        const objectId = new ObjectId();
        if (content && content.mimetype.includes("audio")) {
            const contentUrl = `public/voices/${objectId + "_content." + content.mimetype.split("/")[1]}`;
            await writeFile(contentUrl, content.buffer).then(() => {
                body.contentUrl = contentUrl;
                delete content.buffer;
                body.contentInfo = content;
                console.log("File saved");
            }).catch((err) => {
                isError = true;
                console.log(err);
            });
        }
        let temp = [];
        for (let i = 0; i < 3; i++) {
            const random = Math.floor(Math.random() * hastags.length);
            temp.push(hastags[random]);
        }
        body.categories = temp;
        const post = mappingPost({ ...body, createdBy: resolved["_id"] })
        const user = await mongoDb.collection("users").findOne({ _id: new ObjectId(resolved["_id"]) });
        if (user) {
            await mongoDb.collection("posts").insertOne({ ...post, _id: objectId });
            await mongoDb.collection("users").updateOne({ _id: new ObjectId(resolved["_id"]) }, { $push: { posts: objectId } });
        }
    }
    if (!isError) {
        return response.setSuccess("Success");
    }
    return response.setError("User not found");
}
