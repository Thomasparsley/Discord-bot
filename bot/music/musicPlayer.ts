import { createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } from "@discordjs/voice";
import { SystemChannelFlags, VoiceBasedChannel } from "discord.js";
import { EventEmitter } from "events";
import ytdl from "ytdl-core";

import { emptyQueue, errorConnection, errorSkip, queueList } from "../Vocabulary";
import { PlayerConnection } from "./playerConnection";
import { AudioPlayer } from "./audioPlayer";
import { InfoDownloader } from "./infoDownloader";
import { Empty, Optional } from "../optional";
import { instanceOfSong, Playlist, QueueItem, Song, SongURL } from "./structures";

export class MusicPlayer {
	private disconnectTimeout: NodeJS.Timeout | undefined;
	private playerConnection: PlayerConnection | null;
	private audioPlayer: AudioPlayer | null;
	public queue: Array<QueueItem>;
	
	private audioEmitter: EventEmitter;
	private connectionEmitter: EventEmitter;

	constructor(){
		this.disconnectTimeout = undefined;
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

		this.audioEmitter.on("idle", async () => {
			await this.playSong();
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
			this.disconnectTimeout = setTimeout(() => this.disconnect(), 10e3);
		}
	}

	private async getSong(): Promise<Optional<Song>>{
		try {
			const first = await this.getIndex(0);
			const firstValue = (first as Optional<Song | Playlist>).get();
	
			if (instanceOfSong(firstValue)) {
				return this.queue.pop() as Optional<Song>;
			} else if (firstValue instanceof Playlist) {
				const playlist = this.queue[0] as Optional<Playlist>;
	
				// Hamlet, Act III, Scene I [To be, or not to be]
				const SongOrNotSong = playlist.get().pop();
	
				if (playlist.get().empty()){
					this.queue.pop();
				}
	
				return SongOrNotSong as Optional<Song>;
			}
		} catch (error) {
			console.log(error);
		}
		
		return Empty<Song>();
	}

	private async getIndex(index: number) {
		const item: QueueItem | undefined = this.queue[index];

		if (!item){
			return Empty<Song>();
		}

		if (item instanceof Promise) {
			try {
				const result: Optional<Song | Playlist> = await item;

				if (result.isPresent()) {
					this.queue[index] = result;
					return result;
				} else {
					this.queue.pop();
					return this.getSong();
				}
			} catch (error) {
				console.log(error);
			}
		} else if (item instanceof Optional) {
			return item;
		}

		return Empty<Song>();
	}

	public async getSongList(maxPrint: number){
		let queue = queueList + "\n";
		let counter = 0;

		for (const item of this.queue) {
			if(++counter > maxPrint){
				break;
			}

			const value = (await item).get();
			if (instanceOfSong(value)) {
				const song = value as Song;
				queue += counter + ". " + song.title;
			} else if (value instanceof Playlist) {
				const playlist = value as Playlist;
				queue += "Playlist: " + playlist.getName() + "\n";
				
				for (const song of playlist.getList()) {
					if (counter > maxPrint)
						break;
						
					queue += "\t" + counter + ". " + song.title + "\n";
					counter++;
				}
			}
		}

		return queue;
	}

	public async skipSong(skip: number){
		if(!this.audioPlayer){
			return;
		}
		
		if (skip > 1){
			while (skip > 0 && this.queue.length) {
				const first = this.queue[0];
				console.log(first);

				if (Array.isArray(first) || !(first as Optional<Playlist>).get().empty()) {
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
		if(this.disconnectTimeout){
			clearTimeout(this.disconnectTimeout);
			this.audioEmitter.emit("idle");
		}
	}

	private disconnect() {
		this.playerConnection?.getConnection().destroy();
		this.playerConnection = null;
        
		this.audioPlayer?.getPlayer().stop();
		this.audioPlayer = null;
	}
}