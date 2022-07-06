import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandQueue, emptyQueue } from "../Vocabulary";

export const queueCommand = new Command(
	CommandQueue.name,
	CommandQueue.description,
	new SlashCommandBuilder()
		.addIntegerOption(option => {
			return option
				.setName(CommandQueue.options[0].name)
				.setDescription(CommandQueue.options[0].description)
				.setRequired(false);
		}),
	async ({ interaction, musicPlayer, replySilent }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		const arg = interaction.options.getInteger(CommandQueue.options[0].name);
		const count = (!arg || arg < 1)? 10: arg;

		const message = await musicPlayer.getSongList(count);

		await replySilent(message);
	}
);