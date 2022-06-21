import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Command } from "../command";
import { CommandPing, memeberNotConnected, notValidURL } from "../Vocabulary";

const re = new RegExp("(https:\/\/)?(www.)?(youtube.com|youtu.be)\/(watch\?v=)?(\S)+");

export const command = new Command(
    CommandPing.name,
    CommandPing.description,
    new SlashCommandBuilder()
		.addStringOption(option =>
			option.setName(CommandPing.options[0].name)
				.setDescription(CommandPing.options[0].description)
				.setRequired(true)),
    async ({ interaction, replySilent }) => {
		const voicechannel = (interaction.member as GuildMember)?.voice.channel
		
		if (!voicechannel) {
			await replySilent(memeberNotConnected);
			return;
		}

		const URL = interaction.options.getString(CommandPing.options[0].name);

		if (!URL || !URL.match(re)) {
			await replySilent(notValidURL);
			return;
		}
    }
)