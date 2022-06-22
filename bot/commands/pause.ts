import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandPause, emptyQueue, errorPause, songPaused } from "../Vocabulary";

export const pauseCommand = new Command(
	CommandPause.name,
	CommandPause.description,
	new SlashCommandBuilder(),
	async ({ musicPlayer, replySilent }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		try {
			await musicPlayer.stopPlayer();
			await replySilent(songPaused);
		} catch (err: any) {
			console.error(err);
			await replySilent(errorPause);
			return;
		}
	}
);