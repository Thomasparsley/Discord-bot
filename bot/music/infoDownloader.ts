import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { Empty, Optional, Some } from "../optional";
import { Playlist, Song } from "./structures";



export class InfoDownloader {
	public static async ytSongInfo(url: string): Promise<Optional<Song>> {
		try {
			const result = await ytdl.getBasicInfo(url);
			if (result) {
				return Some<Song>({
					title: result.videoDetails.title,
					url: result.videoDetails.video_url, 
				});
			}
		} catch (error) {
			console.warn(error);
		}

		return Empty<Song>();
	}

	public static async ytPlaylistInfo(url: string): Promise<Optional<Playlist>> {
		try {
			const result = await ytpl(url);

			if(result) {
				const playlist: Playlist = new Playlist(result.url, result.title);

				for(const song of result.items.reverse()) {
					playlist.add({
						title: song.title,
						url: song.shortUrl, 
					});
				}

				return Some(playlist);
			}
		} catch (error) {
			console.warn(error);
		}
		
		return Empty<Playlist>();
	}
} 