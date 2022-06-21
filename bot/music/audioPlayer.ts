import { AudioPlayerStatus, AudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayer as _AudioPlayer, entersState } from "@discordjs/voice";
import { PlayerConnection } from "./playerConnection";
import { EventEmitter } from "events";

export class AudioPlayer {
	private player: _AudioPlayer; 
	private partentEmitter: EventEmitter;
    
	constructor(connection: PlayerConnection, partentEmitter: EventEmitter) {
		this.player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		});
		this.partentEmitter = partentEmitter;

		this.initOnError();
		this.initOnIdle();
		this.initOnPlaying();
		this.initOnPaused();

		connection.getConnection().subscribe(this.player);
	}

	private initOnError() {
		this.player.on("error", (err: Error) => {
			console.warn(err);
			this.partentEmitter.emit("error");
		});
	}

	private initOnIdle() {
		this.player.on(AudioPlayerStatus.Idle, () => {
			this.partentEmitter.emit("idle");
		});
	}

	private initOnPlaying() {
		this.player.on(AudioPlayerStatus.Playing, () => {
			this.partentEmitter.emit("playing");
		});
	}

	private initOnPaused() {
		this.player.on(AudioPlayerStatus.Paused , () => {
			this.partentEmitter.emit("paused");
		});
	}

	public getPlayer() {
		return this.player;
	}

	public play(resource: AudioResource<null>) {
		this.player.play(resource);
	}

	public pause() {
		this.player.pause();
	}
}