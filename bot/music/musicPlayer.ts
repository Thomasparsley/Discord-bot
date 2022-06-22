import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { emptyQueue, errorConnection, errorSkip } from "../Vocabulary";
import { PlayerConnection } from "./playerConnection";
import { AudioPlayer } from "./audioPlayer";
import ytdl from "ytdl-core";

export class MusicPlayer {
	private playerConnection: PlayerConnection | null;
	private audioPlayer: AudioPlayer | null;
	private songs: Array<string>;
    
	private audioEmitter: EventEmitter;
	private connectionEmitter: EventEmitter;

	constructor(){
		this.playerConnection = null;
		this.audioPlayer = null;
		this.songs = [];

		this.audioEmitter = new EventEmitter();
		this.connectionEmitter = new EventEmitter();

		this.initAudioEmitter();
		this.initConnectionEmitter();
	}

	public isConnected() : boolean {
		return (this.playerConnection) ? true : false;
	}

	public async playerConnect(voicechannel: VoiceBasedChannel) {
		this.playerConnection = new PlayerConnection(
			voicechannel.id, 
			voicechannel.guild.id, 
			voicechannel.guild.voiceAdapterCreator,
			this.connectionEmitter);

		try {
			await entersState(this.playerConnection.getConnection(), VoiceConnectionStatus.Ready, 20e3);
			this.connectAudio();
		} catch (error) {
			console.warn(error);
			this.disconnect();
			throw new Error(errorConnection);
		}
	}

	private async connectAudio() {
		if (!this.playerConnection) {
			return;
		}

		this.audioPlayer = new AudioPlayer(this.playerConnection, this.audioEmitter); 

		try {
			await entersState(this.audioPlayer.getPlayer(), AudioPlayerStatus.Idle, 20e3);
			this.audioEmitter.emit("idle");
		} catch (error) {
			console.warn(error);
			this.disconnect();
			throw new Error(errorConnection);
		}
		
	}

	private initAudioEmitter() {
		this.audioEmitter.once("error", () => {
			this.disconnect();
		});

		this.audioEmitter.on("idle", () => {
			if (this.audioPlayer && this.songs.length) {
				const song = this.songs.pop();
                
				if(!song) {
					return;
				}
                   
				const stream = ytdl(song, { filter: "audioonly" });
				const resource = createAudioResource(stream);
				this.audioPlayer.play(resource);
			} else {
				this.disconnect();
			}
		});

		// this.audioEmitter.on("playing", () => {});
		// this.audioEmitter.on("paused", () => {});
	}

	private initConnectionEmitter() {
		this.connectionEmitter.once("error", () => {
			console.log("ERR #2");
			this.disconnect();
		});
	}

	public async skipSong(){
		if(!this.audioPlayer){
			return;
		}

		try {
			await entersState(this.audioPlayer.getPlayer(), AudioPlayerStatus.Playing, 10e3);
			this.audioEmitter.emit("idle");
		} catch (err: any) {
			console.warn(err);
			this.disconnect();
			throw new Error(errorSkip);
		}
	}

	public stopPlayer() {
		if (!this.audioPlayer) {
			throw new Error(emptyQueue);
		}
		const status = this.audioPlayer.getStatus();
		if (status === "playing") {
			this.audioPlayer.pause();
		} else if (status === "paused") {
			this.audioPlayer.unpause();
		}
	}

	public addSong(song: string) {
		this.songs.push(song);
	}

	private disconnect() {
		this.playerConnection?.getConnection().destroy();
		this.playerConnection = null;
        
		this.audioPlayer?.getPlayer().stop();
		this.audioPlayer = null;
	}
}