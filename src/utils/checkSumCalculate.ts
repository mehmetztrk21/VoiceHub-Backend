const { createHash } = require("crypto");
export function calculateCheckSum(content) {
    const buff = Buffer.from(content, "utf-8");
    const hash = createHash("md5").update(buff).digest("hex");
    return hash;
}