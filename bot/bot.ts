
import { REST } from "@discordjs/rest";
import { Awaitable, CacheType, Client, Intents, Interaction } from "discord.js";
import { Command } from "./command";
import { Routes } from 'discord-api-types/v9';

const REST_VERSION = "9"

export class Bot {
    client: Client;
    rest: REST;
    guildId: string;
    clientId: string;
    private token: string;
    
    commands: Map<string, Command>;
    musicQueue: Array<String>;

    private onReady: EventReady
        = async (client: Client) => {}
    private onInteractionCreate: EventInteraction
        = async (interactionArgs: EventInteractionArgs) => {}

    constructor(config: BotConfig) {
        this.commands = new Map<string, Command>();
        this.token = config.token;
        this.guildId = config.guildId;
        this.clientId = config.clientId;  

        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });    
        this.rest = new REST({ version: REST_VERSION }).setToken(config.token);
        this.musicQueue = [];

        this.onReady = config.onReady;
        this.onInteractionCreate = config.onInteractionCreate;

        this.initOnReady();
        this.initOnInteractionCreate();
        this.initCommands(config.commands);
    }

    private initCommands(commands: Command[]){
        commands.forEach(command =>{
            this.commands.set(command.getName(), command);
        });
    }

    private initOnReady() {
        this.client.on('ready', async () => {
            await this.onReady(this.client);
        });
    }

    private initOnInteractionCreate() {
        this.client.on('interactionCreate', async (interaction: Interaction) => {
            const args: EventInteractionArgs = {
                client: this.client, 
                interaction: interaction, 
                commands: this.commands
            }

            await this.onInteractionCreate(args);
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
    onReady: EventReady;
    onInteractionCreate: EventInteraction;
}

interface EventInteractionArgs {
    client: Client; 
    interaction: Interaction<CacheType>;
    commands: Map<string, Command>;
}

export type EventReady = (client: Client) => Awaitable<void>
export type EventInteraction = (interactionArgs: EventInteractionArgs) => Awaitable<void>

