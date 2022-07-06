import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandPP, ppMessage } from "../Vocabulary";

export const ppCommand = new Command(
	CommandPP.name,
	CommandPP.description,
	new SlashCommandBuilder(),
	async ({ interaction }) => {
		const length = Math.floor((Math.random() * 30) + 1); 
		await interaction.reply(ppMessage + length + "cm.");
	}
);