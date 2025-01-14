const { Client, Databases, Account } = require("node-appwrite");

const createAppwriteClient = async (type, session) => {
    const ENDPOINT  = process.env.ENDPOINT
    const PROJECT_ID = process.env.PROJECT_ID
    const API_KEY = process.env.API_KEY
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID);

    if (type === "admin") {
        client.setKey(API_KEY);
    }

    if (type === "session" && session) {
        client.setSession(session);
    }

    return {
        get account() {
            return new Account(client);
        },

        get databases() {
            return new Databases(client);
        },
    };
};

module.exports = createAppwriteClient;