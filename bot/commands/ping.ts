import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../command";
import { CommandPing } from "../Vocabulary";

export const ping = new Command(
    CommandPing.name,
    CommandPing.description,
    new SlashCommandBuilder(),
    async ({ interaction }) => {
        await interaction.reply("Pong!");
    }
)