import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { errorConnection } from "../Vocabulary";
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
		} catch (error) {
			console.warn(error);
			this.disconnect();
			throw new Error(errorConnection);
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
				console.log(song);
                
				if (!song) {
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
			this.disconnect();
		});
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