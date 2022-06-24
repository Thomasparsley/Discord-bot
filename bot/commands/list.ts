import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { Playlist, Song } from "../music/musicPlayer";
import { Optional } from "../optional";
import { CommandList, emptyQueue } from "../Vocabulary";

export const listCommand = new Command(
	CommandList.name,
	CommandList.description,
	new SlashCommandBuilder(),
	async ({ musicPlayer, replySilent }) => {
		if (!musicPlayer.isConnected()) {
			await replySilent(emptyQueue);
			return;
		}

		console.log("Queue: ");
		musicPlayer.queue.forEach(el => {
			if (el instanceof Promise) {
				console.log(el);
			}
			console.log((el as Optional<Song | Playlist>).get());
		});

		await replySilent("emptyQueue");
	}
);