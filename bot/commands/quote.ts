import { SlashCommandBuilder } from "@discordjs/builders";
import { Snowflake, TextChannel } from "discord.js";
import { Command } from "../command";
import { CommandQuote, errorQuote} from "../Vocabulary";

const quoteRoom: Snowflake = "845012767668961310";

export const qouteCommand = new Command(
	CommandQuote.name,
	CommandQuote.description,
	new SlashCommandBuilder(),
	async ({ interaction, replySilent, reply }) => {
		const guild = interaction.guild;
		const room = guild?.channels.cache.get(quoteRoom);

		if (!guild || !room) {
			await replySilent(errorQuote);
			return;
		}

		try {
			const messages = await (room as TextChannel).messages.fetch({ limit: 100 });
			const number = Math.floor(Math.random() * messages.size);
			const message = messages.at(number);

			if (message){
				await reply(message.content);
			} else {
				await replySilent(errorQuote);
				return;
			}
		} catch (error) {
			console.log(error);
			await replySilent(errorQuote);
			return;
		}
	}
);