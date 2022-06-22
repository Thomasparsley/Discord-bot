import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandSkip, emptyQueue, errorSkip, songSkipped } from "../Vocabulary";

export const skipCommand = new Command(
	CommandSkip.name,
	CommandSkip.description,
	new SlashCommandBuilder(),
	async ({ musicPlayer, replySilent }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		try {
			await musicPlayer.skipSong();
			await replySilent(songSkipped);
		} catch (err: any) {
			console.error(err);
			await replySilent(errorSkip);
			return;
		}
	}
);