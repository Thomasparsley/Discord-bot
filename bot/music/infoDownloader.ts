const sptyt = require("spotify-to-yt");
import ytdl from "ytdl-core";
import ytpl from "ytpl";

import { Playlist, Song } from "./musicPlayer";

export class InfoDownloader {
	public async ytSongInfo(url: string): Promise<Song | undefined> {
		return ytdl.getBasicInfo(url)
			.catch((error: any) => {
				console.warn(error);
			})
			.then((result: void | ytdl.videoInfo) => {
				if(result) {
					const song: Song = {
						title: result.videoDetails.title,
						url: result.videoDetails.video_url, 
					};

					return song;
				}
			});
	}

	public async ytPlaylistInfo(url: string): Promise<Playlist | undefined>{
		return ytpl(url)
			.catch((error: any) => {
				console.warn(error);
			})
			.then((result: void | ytpl.Result) => {
				if(result){
					const playlist: Array<Song> = [];

					for(const item of result.items) {
						playlist.push({
							title: item.title,
							url: item.shortUrl, 
						});
					}

					return playlist;
				}

				return;
			});
	}

	public async spSongInfo(url: string): Promise<Song | undefined>{
		return sptyt.trackGet(url)
			.catch((error: any) => {
				console.warn(error);
			})
			.then((song: any) => {
				if(song){
					return {
						title: song.info[0].title,
						url: song.url, 
					};
				}
			});
	}

	public async spPlaylistInfo(url: string): Promise<Playlist | undefined>{
		return sptyt.playListGet(url)
			.catch((error: any) => {
				console.warn(error);
			})
			.then((search: any) => {
				if(search){
					const playlist: Playlist = [];

					for(const url of search.songs) {
						playlist.push(
							this.ytSongInfo(url)
						);
					}

					return playlist;
				}

				return;
			});
	}
} 