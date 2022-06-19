import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandPing } from "../commandList";

export const ping = new Command(
    CommandPing.name,
    CommandPing.description,
    new SlashCommandBuilder(),
    async ({ interaction }) => {
        await interaction.reply("Pong!");
    }
)