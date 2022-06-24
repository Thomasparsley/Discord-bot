import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import ytdl from "ytdl-core";

import { emptyQueue, errorConnection, errorSkip } from "../Vocabulary";
import { PlayerConnection } from "./playerConnection";
import { AudioPlayer } from "./audioPlayer";
import { InfoDownloader } from "./infoDownloader";
import { Empty, Optional, Some } from "../optional";

export class MusicPlayer {
	private playerConnection: PlayerConnection | null;
	private audioPlayer: AudioPlayer | null;
	public queue: Array<QueueItem>;
    
	private audioEmitter: EventEmitter;
	private connectionEmitter: EventEmitter;

	constructor(){
		this.playerConnection = null;
		this.audioPlayer = null;
		this.queue = [];

		this.audioEmitter = new EventEmitter();
		this.connectionEmitter = new EventEmitter();

		this.initAudioEmitter();
		this.initConnectionEmitter();
	}

	public isConnected(): boolean {
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
			this.playSong();
		});
	}

	private initConnectionEmitter() {
		this.connectionEmitter.once("error", () => {
			console.log("ERR #2");
			this.disconnect();
		});

		this.connectionEmitter.once("disconnected", () => {
			this.disconnect();
		});
	}

	private async playSong(){
		const song = await this.getSong();

		if (this.audioPlayer && song.isPresent()) {
			const options: ytdl.downloadOptions = {
				filter: "audioonly",
				dlChunkSize: 0,
				highWaterMark: 1 << 62,
				liveBuffer: 1 << 62,
				quality: "lowestaudio",
			};

			const stream = ytdl(song.get().url, options);
			const resource = createAudioResource(stream);
			this.audioPlayer.play(resource);
		} else if (!this.queue.length) {
			this.disconnect();
			// setTimeout(() => this.playSong(), 60e3);
		}
	}

	private async getSong(): Promise<Optional<Song>>{
		const empty = Empty<Song>();

		const item: QueueItem | undefined = this.queue[0];

		if (!item){
			return empty;
		}

		if (item instanceof Promise) {
			const result: Optional<Song | Playlist> = await item;

			if (result.isPresent()) {
				this.queue[0] = result;
			} else {
				this.queue.pop();
				return this.getSong();
			}
		}

		const first = (this.queue[0] as Optional<Song | Playlist>).get();
		if (instanceOfSong(first)) {
			return this.queue.pop() as Optional<Song>;	
		} else if (Array.isArray(first)) {
			const playlist = this.queue[0] as Optional<Playlist>;

			// Hamlet, Act III, Scene I [To be, or not to be]
			const SongOrNotSong = Some<Song | undefined>(playlist.get().pop());

			if (!playlist.get().length){
				this.queue.pop();
			}
				
			return SongOrNotSong as Optional<Song>;
		}
		
		return empty;
	}

	public async skipSong(skip: number){
		if(!this.audioPlayer){
			return;
		}
		
		if (skip > 1){
			while (skip > 0 && this.queue.length) {
				const first = this.queue[0];
				console.log(first);

				if (Array.isArray(first) || (first as Optional<Playlist>).get().length) {
					(first as Optional<Playlist>).get().pop();
				} else {	
					this.queue.pop();
				}

				skip--;
			}
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

	public async add(songURL: SongURL) {
		const url = songURL.url;

		if(songURL.type === "youtube") {
			if (!url.includes("&list=")){
				this.queue.push(
					InfoDownloader.ytSongInfo(url)
				);
			} else {
				this.queue.push(
					InfoDownloader.ytPlaylistInfo(url)
				);
			}
		} 
	}

	private disconnect() {
		this.playerConnection?.getConnection().destroy();
		this.playerConnection = null;
        
		this.audioPlayer?.getPlayer().stop();
		this.audioPlayer = null;
	}
}

export interface SongURL{
	url: string;
	type: "youtube" | "spotify";
}

export interface Song {
	title: string;
	url: string;
}

type QueueItem = Optional<Song | Playlist> | Promise<Optional<Song | Playlist>>;
export type Playlist = Array<Song>;

function instanceOfSong(object: any): boolean {
	if (typeof object === "object"){
		return "title" in object || "url" in object;
	}
    
	return false;
}
