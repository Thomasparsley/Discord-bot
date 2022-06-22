import { AudioPlayerStatus, AudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayer as _AudioPlayer, entersState } from "@discordjs/voice";
import { PlayerConnection } from "./playerConnection";
import { EventEmitter } from "events";

export class AudioPlayer {
	private player: _AudioPlayer; 
	private status: "init" | "idle" | "playing" | "paused";
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
		this.status = "init";
	}

	private initOnError() {
		this.player.on("error", (err: Error) => {
			console.log("ERR #1");
			console.warn(err);
			this.partentEmitter.emit("error");
		});
	}

	private initOnIdle() {
		this.player.on(AudioPlayerStatus.Idle, () => {
			this.partentEmitter.emit("idle");
			this.status = "idle";
		});
	}

	private initOnPlaying() {
		this.player.on(AudioPlayerStatus.Playing, () => {
			this.partentEmitter.emit("playing");
			this.status = "playing";
		});
	}

	private initOnPaused() {
		this.player.on(AudioPlayerStatus.Paused , () => {
			this.partentEmitter.emit("paused");
			this.status = "paused";
		});
	}

	public getStatus(): "init" | "idle" | "playing" | "paused" {
		return this.status;
	}

	public getPlayer():_AudioPlayer {
		return this.player;
	}

	public play(resource: AudioResource<null>) {
		this.player.play(resource);
	}

	public pause() {
		this.player.pause();
	}

	public unpause() {
		this.player.unpause();
	}
}