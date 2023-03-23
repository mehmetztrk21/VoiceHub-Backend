
import fs from "fs";
class AppConfig {
    development: AppConfigScope;
    production: AppConfigScope;
}

class AppConfigScope {
    db: AppConfigDB;
    redis: AppConfigRedis;
    apidb: AppConfigDB;
    mongodb: string;
    jwt: AppConfigJWT;
    constants: AppConfigConstants;
}
class AppConfigRedis {
    url: string;
    username: string;
    password: string;
    ttl: number;
}
class AppConfigJWT {
    secret: string;
    algorithm: string;
    expiresIn: string;
}
class AppConfigDB {
    client: string;
    connection: AppConfigDBConnection;
}
class AppConfigDBConnection {
    host: string;
    user: string;
    password: string;
    database: string;
}
class AppConfigConstants {
    ApplicationId: string;
    tripUrl: string;
    tripCountryCode: string;
    tripKey: string;
    tripSignature: string;
    contentType: string;
    driverUrl: string;
    driverKey: string;
    driverSignature: string;
}
var config: any = null;
export async function getConfig(): Promise<AppConfigScope | null> {
    if (!config) {
        config = await new Promise((resolve, reject) => {
            fs.readFile("knexctl.json", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    }
    return config || null;
}