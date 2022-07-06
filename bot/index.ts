import { Bot } from "./bot";
import onReady from "./events/onReady";
import onInteractionCreate from "./events/onInteractionCreate";

let clientId, guildId, token;
try {
	const config = require("../config.json");
	clientId = config.clientId;
	guildId = config.guildId;
	token = config.token;
} catch (error: any) {
	clientId = process.env.DISCORD_CLIENT_ID;
	guildId = process.env.DISCORD_GUILD_ID;
	token = process.env.DISCORD_TOKEN;
}

console.log({clientId, guildId, token});

import {
	pingCommand,
	playCommand,
	skipCommand,
	pauseCommand,
	queueCommand,
	shuffleCommand,
	qouteCommand,
	ppCommand,
	ballCommand,
} from "./commands";

const commands = [
	pingCommand,
	playCommand,
	skipCommand,
	pauseCommand,
	queueCommand,
	shuffleCommand,
	qouteCommand,
	ppCommand,
	ballCommand,
];

const bot = new Bot({
	token: token,
	guildId: guildId,
	clientId: clientId,
	commands: commands,
	onReady: onReady,
	onInteractionCreate: onInteractionCreate,
});

(async () => {
	await bot.buildCommads(commands);
	await bot.login();
})();