import { CommandInteraction } from "discord.js";
import { EventInteraction } from "../bot";
import { CommandArgs } from "../command";
import { unknownCommand, executeError } from "../Vocabulary";

const event: EventInteraction = async (interactionArgs) => {
    const { client, interaction, commands } = interactionArgs;

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
    }

    try {
        if (!command) {
            await replySilent(unknownCommand);
            return;
        }

        const commandArgs: CommandArgs = {
            client: client,
            interaction: commandInteraction,
            replySilent: replySilent,
        }

        await command.execute(commandArgs);
    } catch (err) {
        console.error(err);
        await replySilent(executeError);
    }
}

export default event