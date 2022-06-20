import { Client, Awaitable, CommandInteraction, CacheType } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders";

export interface CommandArgs {
    client: Client;
    interaction: CommandInteraction<CacheType>;
    replySilent: (content: string) => Promise<void>;
};

export type CommandAction = (args: CommandArgs) => Awaitable<void>;

export class Command {
    private name: string;
    private description: string;
    private builder: SlashCommandBuilder;
    readonly execute: CommandAction;

    constructor(name: string, description: string, builder: SlashCommandBuilder, execute: CommandAction) {
        this.name = name;
        this.description = description;
        this.builder = builder;
        this.execute = execute;
        
        this.builder.setName(name);
        this.builder.setDescription(description);
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getBuilder(): SlashCommandBuilder {
        return this.builder;
    }
}
