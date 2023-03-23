import { NextApplication, NextContextBase, NextPlugin } from "fastapi-next";
import { NextHealthCheckStatus } from "fastapi-next/build/config/NextOptions";
import { MongoClient } from "mongodb";
import {getConfig } from "../Config";


export class NextMongoPlugin extends NextPlugin<MongoClient>{
    client: MongoClient;
    constructor(public config: any, name: string = "db") {
        super(name, true);
    }
    async initClient() {
        const config = this.config;

        this.client = new MongoClient(config, { keepAlive: true });
    }
    async retrieve(next: NextContextBase): Promise<MongoClient> {
        const config = this.config;
        if (!this.client) {
            await this.initClient.call(this);
            this.client.on('error', (err) => {
                console.error(err);
            });
            this.client.on('close', () => {
                this.initClient.call(this);
            });
            await this.client.connect().catch(console.error);
        }
        return this.client;
    }
    async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        const config = await getConfig();
        const db = this.client.db("voiceHub");
        var hasError = false;
        await db.collection("HealthCheck").findOne({}).catch(err => {
            hasError = true;
        });
        return hasError ? NextHealthCheckStatus.Dead() : NextHealthCheckStatus.Alive();
    }
}