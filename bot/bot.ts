
import { REST } from "@discordjs/rest";
import { Awaitable, Client, Intents } from "discord.js";
import { Command } from "./command";
import { Routes } from 'discord-api-types/v9';

const REST_VERSION = "9"

export class Bot {
    client: Client;
    rest: REST;
    guildId: string;
    clientId: string;
    private token: string;
    
    commands: Array<Command>;
    musicQueue: Array<String>;

    private onReady: EventType
        = async (client: Client) => {}

    constructor(config: BotConfig) {
        this.token = config.token;
        this.guildId = config.guildId;
        this.clientId = config.clientId;  

        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });    
        this.rest = new REST({ version: REST_VERSION }).setToken(config.token);

        this.musicQueue = [];
        this.commands = config.commands;

        this.onReady = config.onReady;

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

    public async buildCommads(commands: Command[]) {
        const slashCommands = commands.map(command => {
            return command.getBuilder().toJSON();
        });
    
        this.rest.put(Routes.applicationGuildCommands(this.clientId, this.guildId), { body: slashCommands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    }
}

interface BotConfig {
    token: string;
    guildId: string;
    clientId: string;
    commands: Array<Command>;
    onReady: EventType;
}

export type EventType = (client: Client) => Awaitable<void>