import { Bot } from "./bot";
import onReady from "./events/onReady";
import onInteractionCreate from "./events/onInteractionCreate";

const { clientId, guildId, token } = require("../config.json");

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