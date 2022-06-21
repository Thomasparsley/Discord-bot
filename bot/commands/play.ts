import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Command } from "../command";
import { CommandPlay, memeberNotConnected, notValidURL } from "../Vocabulary";

const re = /(https:\/\/)?(www.)?(youtube.com|youtu.be)\/(watch\?v=)?(\S)+/g;

export const playCommand = new Command(
    CommandPlay.name,
    CommandPlay.description,
    new SlashCommandBuilder()
		.addStringOption(option =>
			option.setName(CommandPlay.options[0].name)
				.setDescription(CommandPlay.options[0].description)
				.setRequired(true)),
    async ({ client, interaction, musicPlayer, replySilent }) => {
		const voicechannel = (interaction.member as GuildMember)?.voice.channel
		
		if (!voicechannel) {
			await replySilent(memeberNotConnected);
			return;
		}

		// const URL = interaction.options.getString(CommandPlay.options[0].name);
		const URL = "https://www.youtube.com/watch?v=yWzsR-j5waY";

		if (!URL || !URL.match(re)) {
			await replySilent(notValidURL);
			return;
		}

		// add song

		if (!musicPlayer.isConnected()){
			musicPlayer.playerConnect(voicechannel);
		} 
    }
)