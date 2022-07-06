import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandBall } from "../Vocabulary";

export const ballCommand = new Command(
	CommandBall.name,
	CommandBall.description,
	new SlashCommandBuilder().addStringOption(option =>
		option.setName(CommandBall.options[0].name)
			.setDescription(CommandBall.options[0].description)
			.setRequired(true)),
	async ({ interaction }) => {
		const question = interaction.options.getString(CommandBall.options[0].name);
		const answers = CommandBall.answers;
		const number = Math.floor(Math.random() * answers.length); 
		await interaction.reply(question + "\n\n" + answers[number]);
	}
);