import { Bot } from "./bot"
import onReady from "./events/onReady"

const { clientId, guildId, token } = require('../config.json');

const bot = new Bot({
    token: token,
    guildId: guildId,
    applicationId: clientId,
    onReady: onReady,
});

(async () => {
    await bot.login();
})()