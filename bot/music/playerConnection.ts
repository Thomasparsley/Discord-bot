import { joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { InternalDiscordGatewayAdapterCreator } from "discord.js";
import { EventEmitter } from "events";

export class PlayerConnection {
	private connection: VoiceConnection;
	private partentEmitter: EventEmitter;

	constructor (channelId: string, guildId: string, adapterCreator: InternalDiscordGatewayAdapterCreator, partentEmitter: EventEmitter){
		this.connection = joinVoiceChannel({
			channelId: channelId,
			guildId: guildId,
			adapterCreator: adapterCreator,
		});
		this.partentEmitter = partentEmitter;

		this.initOnError();
		this.initDisconnected();
		this.initConnecting();
		this.initSignalling();
	}

	private initOnError() {
		this.connection.on("error", (err: Error) => {
			console.warn(err);
			this.partentEmitter.emit("error");
		});
	}

	private initSignalling() {
		this.connection.on(VoiceConnectionStatus.Signalling, () => {
			console.log("The connection has entered the Signalling state.");
		});
	}

	private initConnecting() {
		this.connection.on(VoiceConnectionStatus.Connecting, () => {
			console.log("The connection has entered the Connecting state.");
		});
	}

	private initDisconnected() {
		this.connection.on(VoiceConnectionStatus.Disconnected, () => {
			this.partentEmitter.emit("disconnected");
		});
	}

	public getConnection() {
		return this.connection;
	}
}