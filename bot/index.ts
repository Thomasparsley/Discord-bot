import { Bot } from "./bot"
import onReady from "./events/onReady"

const { clientId, guildId, token } = require('../config.json');

import {
    ping,
} from "./commands";

const commands = [
    ping
];

const bot = new Bot({
    token: token,
    guildId: guildId,
    clientId: clientId,
    commands: commands,
    onReady: onReady,
});

(async () => {
    await bot.buildCommads(commands);
    await bot.login();
})()