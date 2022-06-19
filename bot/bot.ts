
import { Awaitable, Client, Intents } from "discord.js";

export class Bot {
    client: Client;

    private token: string;
    private guildId: string;
    private applicationId: string;
    
    private onReady: EventType
        = async (client: Client) => {}

    constructor(config: BotConfig) {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });    
        this.token = config.token;
        this.guildId = config.guildId;
        this.applicationId = config.applicationId;    

        if (config.onReady) {
            this.onReady = config.onReady;
        }

        this.initOnReady();
    }

    private initOnReady() {
        this.client.on('ready', async () => {
            await this.onReady(this.client);
        });
    }

    public async login() {
        await this.client.login(this.token);
    }
}

interface BotConfig {
    token: string;
    guildId: string;
    applicationId: string;
    onReady: EventType;
}

export type EventType = (client: Client) => Awaitable<void>