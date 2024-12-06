import http from "http"
import https from "https"
import app from "./app"
import dotenv from "dotenv"
import { readFile } from "fs/promises"
import mongoose from 'mongoose';
import { User } from "./model/UserModel"
import { Tournament } from "./model/TournamentModel"
import { fillDatabank } from "./data"
import { KOPhase } from "./model/KOPhaseModel"
import { Block } from "./model/BlockModel"

dotenv.config()

async function setup() {

    const useSSL = process.env.USE_SSL === 'true';
    const httpsPort = process.env.HTTPS_PORT
        ? parseInt(process.env.HTTPS_PORT) : 3001;

    let mongodURI = process.env.DB_CONNECTION_STRING;
    if (!mongodURI) {
        process.exit(1);
    }
    if (mongodURI === "memory") {
        const MMS = await import('mongodb-memory-server')
        const mongo = await MMS.MongoMemoryServer.create();
        mongodURI = mongo.getUri();
    }

    await mongoose.connect(mongodURI);
    console.log("connected")

    if (useSSL) {
        const [privateSSLKey, publicSSLCert] = await Promise.all([
            readFile(process.env.SSL_KEY_FILE!),
            readFile(process.env.SSL_CERT_FILE!)]);
        const httpsServer = https.createServer({ key: privateSSLKey, cert: publicSSLCert }, app);
        httpsServer.listen(httpsPort, () => {
            console.log(`Listening for HTTPS at https://localhost:${httpsPort}`);
        });
    }
    else {
        const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000;
        const httpServer = http.createServer(app);
        httpServer.listen(port, () => {
            console.log(`Listening for HTTP at http://localhost:${port}`);
            console.log('   ______  ____    ______ ___  ___   ________  ______   ______  ______')
            console.log('  /  ___/ / _  |  /  ___/ |  |/  /  /__   __/ / _   /  /  ___/ /  ___/')
            console.log(' /  ___/ /     | /___  /  /   /       /  /   /    <   /  ___/ /  ___/')
            console.log('/_____/ /__/|__|/_____/  /___/       /__/   /__/|__| /_____/ /_____/')
            console.log('Backend')
            console.log(' ')
        });
    }

    /*try {
        await User.deleteMany();
        await Tournament.deleteMany();
        await Block.deleteMany();
        await KOPhase.deleteMany();
        fillDatabank();
        console.log("Databank deleted, dummy data created");
    } catch(e) {
        console.log(e)
        throw new Error("failed")
    }*/
};

setup();