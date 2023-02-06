import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import multer, { Multer } from "multer";
import path from "path";

export default async function getSettings(app: any) {
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
    app.use(bodyParser.json())
    app.use(fileUpload());
    app.use((req: any, res: any, next: any) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        next();
    });
}

export const multerSettings = (): Multer => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../../src/uploads'))
        }
        ,
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })

    const fileFilter = (req: any, file: any, cb: any) => {
        const allowedFileTypes = ["audio/mp3", "audio/mpeg", "audio/mp4"];
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"), false);
        }
        cb(null, true);
    };

    const upload: Multer = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5
        },
        fileFilter: fileFilter
    });
    return upload;
}