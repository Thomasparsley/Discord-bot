import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Command } from "../command";
import { SongURL } from "../music/musicPlayer";
import { CommandPlay, errorArg, memeberNotConnected, songAdded } from "../Vocabulary";
import ytsr from "ytsr";

const reYT = /(https:\/\/)?(www.)?(youtube.com|youtu.be)(\S)+/g;
const reSpotify = /(https:\/\/)?(www.)?(open.spotify.com)\/(track\/|playlist\/|album\/){1}(\S)+/g;

export const playCommand = new Command(
	CommandPlay.name,
	CommandPlay.description,
	new SlashCommandBuilder()
		.addStringOption(option =>
			option.setName(CommandPlay.options[0].name)
				.setDescription(CommandPlay.options[0].description)
				.setRequired(true)),
	async ({ interaction, musicPlayer, replySilent }) => {
		const voicechannel = (interaction.member as GuildMember)?.voice.channel;
		
		if (!voicechannel) {
			await replySilent(memeberNotConnected);
			return;
		}

		const arg = interaction.options.getString(CommandPlay.options[0].name);
		let songURL: SongURL | void;

		if (!arg) {
			await replySilent(errorArg);
			return;
		} else if (arg.match(reYT)) {
			songURL = {
				url: arg,
				type: "youtube",
			};
		} else if (arg.match(reSpotify)) {
			songURL = {
				url: arg,
				type: "spotify",
			};
		} else {
			songURL = await ytsr(arg, {limit: 1})
				.catch((error:any) => {
					return; 
				})
				.then((search:any) => {
					if (search.items.length){
						return {
							url: search.items[0].url,
							type: "youtube",
						};
					} 

					return;
				});
		}

		if (!songURL) {
			await replySilent(errorArg);
			return;
		}

		try {
			musicPlayer.add(songURL);
		} catch (err:any) {
			await replySilent(err);
			return;
		}

		if (!musicPlayer.isConnected()){
			try {
				await musicPlayer.playerConnect(voicechannel);
			} catch (err: any) {
				await replySilent(err);
				return;
			}
		}
		
		await replySilent(songAdded + `(${arg})`);
	}
);