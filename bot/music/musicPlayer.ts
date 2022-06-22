import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import { emptyQueue, errorConnection, errorSkip } from "../Vocabulary";
import { PlayerConnection } from "./playerConnection";
import { AudioPlayer } from "./audioPlayer";

import ytdl from "ytdl-core";
const sptyt = require("spotify-to-yt");
import ytpl from "ytpl";

export class MusicPlayer {
	private playerConnection: PlayerConnection | null;
	private audioPlayer: AudioPlayer | null;
	private songs: Array<Song>;
    
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

	private playSong(){
		const song = this.songs.pop();

		if (this.audioPlayer && song) {
			const stream = ytdl(song.url, { filter: "audioonly" });
			const resource = createAudioResource(stream);
			this.audioPlayer.play(resource);
		} else {
			this.disconnect();
		}
	}

	public async skipSong(skip: number){
		if(!this.audioPlayer){
			return;
		}

		while (skip > 0) {
			this.songs.pop();
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

	public add(songURL: SongURL) {
		if(songURL.type === "youtube") {
			this.addYoutube(songURL.url);
		} else {
			this.addSpotify(songURL.url);
		}
	}

	private addYoutube(url: string) {
		if (!url.includes("&list=")){
			ytdl.getBasicInfo(url)
				.catch((error:any) => {
					console.warn(error);
				})
				.then((song:void | ytdl.videoInfo) => {
					if(song) {
						this.songs.push(
							{
								title: song.videoDetails.title,
								url: song.videoDetails.video_url, 
							});
					}
				});
		} else {
			ytpl(url)
				.catch((error:any) => {
					console.warn(error);
				})
				.then((playlist:void | ytpl.Result) => {
					if(playlist){
						for(const item of playlist.items) {
							this.songs.push({
								title: item.title,
								url: item.shortUrl, 
							});
						}
					}
				});
		}
	}

	private addSpotify(url: string) {
		if (url.includes("/track/")){
			sptyt.trackGet(url)
				.catch((error:any) => {
					console.warn(error);
				})
				.then((song:any) => {
					if(song){
						this.songs.push(
							{
								title: song.info[0].title,
								url: song.url, 
							});
					}
				});
		} else {
			sptyt.playListGet(url)
				.catch((error:any) => {
					console.warn(error);
				})
				.then((playlist:any) => {
					if(playlist){
						for(const url of playlist.songs) {
							this.addYoutube(url);
						}
					}
				});
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

interface Song {
	title: string;
	url: string;
}