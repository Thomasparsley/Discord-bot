import { CommandInteraction } from "discord.js";
import { EventInteraction } from "../bot";
import { CommandArgs } from "../command";
import { unknownCommand, executeError } from "../Vocabulary";

const event: EventInteraction = async (interactionArgs) => {
	const { client, interaction, commands, musicPlayer } = interactionArgs;

	if(!interaction.isCommand){
		return;
	}

	const commandInteraction = (interaction as CommandInteraction);

	const command = commands.get(commandInteraction.commandName);

	const replySilent = async (content: string): Promise<void> => {
		return await commandInteraction.reply({
			content,
			ephemeral: true,
		});
	};

	const reply = async (content: string): Promise<void> => {
		return await commandInteraction.reply({
			content,
		});
	};

	try {
		if (!command) {
			await replySilent(unknownCommand);
			return;
		}

		const commandArgs: CommandArgs = {
			client: client,
			interaction: commandInteraction,
			replySilent: replySilent,
			musicPlayer: musicPlayer,
			reply: reply,
		};

		await command.execute(commandArgs);
	} catch (err) {
		console.error(err);
		await replySilent(executeError);
	}
};

export default event;