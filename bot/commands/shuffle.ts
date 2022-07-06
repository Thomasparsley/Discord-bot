import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandShuffle, emptyQueue, errorShuffle, shuffleSuccessful } from "../Vocabulary";

export const shuffleCommand = new Command(
	CommandShuffle.name,
	CommandShuffle.description,
	new SlashCommandBuilder(),
	async ({ musicPlayer, replySilent }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		try {
			await musicPlayer.shuffleQueue();
			await replySilent(shuffleSuccessful);
		} catch (err: any) {
			console.error(err);
			await replySilent(errorShuffle);
			return;
		}
	}
);