import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import ytdl from "ytdl-core";

import { emptyQueue, errorConnection, errorSkip } from "../Vocabulary";
import { PlayerConnection } from "./playerConnection";
import { AudioPlayer } from "./audioPlayer";
import { InfoDownloader } from "./infoDownloader";

export class MusicPlayer {
	private playerConnection: PlayerConnection | null;
	private audioPlayer: AudioPlayer | null;
	private queue: Array<Song | Playlist | Promise<Song | Playlist | undefined>>;

	private downloader: InfoDownloader;
    
	private audioEmitter: EventEmitter;
	private connectionEmitter: EventEmitter;

	constructor(){
		this.playerConnection = null;
		this.audioPlayer = null;
		this.queue = [];
		this.downloader = new InfoDownloader();

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
			console.log(this.queue);
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
		console.log("Song: " + song, " Queue: " + this.queue);

		if (this.audioPlayer && song) {
			const options:ytdl.downloadOptions = {
				filter: "audioonly",
				dlChunkSize: 0,
				highWaterMark: 1 << 62,
				liveBuffer: 1 << 62,
				quality: "lowestaudio",
			};

			const stream = ytdl(song.url, options);
			const resource = createAudioResource(stream);
			this.audioPlayer.play(resource);
		} else if (!this.queue.length) {
			this.disconnect();
		} else {
			setTimeout(() => this.playSong(), 5e3);
		}
	}

	private async getSong(): Promise<Song | undefined>{
		const item = this.queue[0];

		if (item instanceof Promise) {
			const promiseResult = await item.then(
				(queueItem: Song | Playlist | undefined) => {
					return queueItem;
				});
			
			if (promiseResult) {
				this.queue[0] = promiseResult;
			} else {
				this.queue.pop();
				return this.getSong();
			}
		}

		if (instanceOfSong(this.queue[0])) {
			return (this.queue.pop() as Song);
		} else if (Array.isArray(item)) {
			const playlist = (this.queue[0] as Playlist);

			if (playlist.length) {
				return (playlist.pop() as Song);
			} else {
				this.queue.pop();
				return this.getSong();
			}
		}

		return undefined;
	}

	public async skipSong(skip: number){
		if(!this.audioPlayer){
			return;
		}

		while (skip > 0) {
			this.queue.pop();
			skip--;
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
					this.downloader.ytSongInfo(url)
				);
			} else {
				this.queue.push(
					this.downloader.ytPlaylistInfo(url)
				);
			}
		} 
		// else {
		// 	if (url.includes("/track/")){
		// 		this.queue.push(
		// 			this.downloader.spSongInfo(url)
		// 		);
		// 	} else {
		// 		const playlist:Playlist | undefined = await this.downloader.spPlaylistInfo(url);

		// 		console.log(await this.downloader.spPlaylistInfo(url));
		// 		if (playlist) {
		// 			this.queue.push(playlist);
		// 		}
		// 	}
		// }
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

export type Playlist = Array<Song | Promise<Song | undefined>>;

function instanceOfSong(object: any): boolean {
	if (typeof object === "object"){
		return "title" in object || "url" in object;
	}
    
	return false;
}