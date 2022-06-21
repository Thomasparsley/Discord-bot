import { Client, Awaitable, CommandInteraction, CacheType } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MusicPlayer } from "./music/musicPlayer";

export interface CommandArgs {
    client: Client;
    interaction: CommandInteraction<CacheType>;
    musicPlayer: MusicPlayer;
    replySilent: (content: string) => Promise<void>;
}

export type CommandAction = (args: CommandArgs) => Awaitable<void>;
type CommandBuilder = SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export class Command {
	private name: string;
	private description: string;
	private builder: CommandBuilder;
	readonly execute: CommandAction;

	constructor(name: string, description: string, builder: CommandBuilder, execute: CommandAction) {
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

	public getBuilder(): CommandBuilder {
		return this.builder;
	}
}
