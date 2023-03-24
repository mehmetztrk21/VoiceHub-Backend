import { NextApplication, NextFileResolverPlugin, NextKnexPlugin, NextOptions, NextSessionOptions } from "fastapi-next";
import path from "path";
import { NextMongoPlugin } from "./plugins/NextMongoPlugin";
import { getConfig } from "./Config";

const options = new NextOptions();
options.debug = true;
options.openApi.enabled = true;
options.swagger.enabled = true;
options.openApi.title = "Voice Hub API";
options.openApi.description = "Voice Hub API Documentation";
options.openApi.version = "1.0.0";
options.openApi.https = false;
options.openApi.http= true;
options.routerDirs.push(path.join(__dirname, "routers"));
//swagger
const app = new NextApplication(options);
async function main() {
    const config = await getConfig();
    if (!config) {
        console.error("Config not found");
        process.exit(-1);
    }
    const EventEmitter = require('events');
    const emitter = new EventEmitter();

    emitter.setMaxListeners(2000);
    const appdb = new NextKnexPlugin(config.db, "db");

    app.registry.register(appdb);
    app.registry.register(new NextFileResolverPlugin());
    app.registry.register(new NextMongoPlugin(config.mongodb, "voiceHubDb"));

    // ? JWT
    app.registerJWT({
        anonymousPaths: [
            /^\/?auth.*/,
            /^\/?openapi.json/,
            /^\/?swagger.*/,
            /^\/?public.*/,

        ],
        secret: "somesupersecretsecret",
        signOptions: {
            expiresIn: "1d"
        }
    });

    app.registry.registerObject("jwt", app.jwtController);

    await app.registerInMemorySession({
    } as NextSessionOptions);

    // ? Init
    await app.init();


    // ? Start
    await app.start();
}
main();