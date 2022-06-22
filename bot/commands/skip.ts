import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandSkip, emptyQueue, errorSkip, songSkipped } from "../Vocabulary";

export const skipCommand = new Command(
	CommandSkip.name,
	CommandSkip.description,
	new SlashCommandBuilder()
		.addIntegerOption(option => {
			return option
				.setName(CommandSkip.options[0].name)
				.setDescription(CommandSkip.options[0].description)
				.setRequired(false);
		}),
	async ({ musicPlayer, replySilent, interaction }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		const arg = interaction.options.getInteger(CommandSkip.options[0].name);
		const count = (arg)? arg: 0;

		try {
			await musicPlayer.skipSong(count);
			await replySilent(songSkipped);
		} catch (err: any) {
			console.error(err);
			await replySilent(errorSkip);
			return;
		}
	}
);