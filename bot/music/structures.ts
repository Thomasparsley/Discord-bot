import { Optional, Some } from "../optional";

export interface SongURL {
	url: string;
	type: "youtube" | "spotify";
}

export interface Song {
	title: string;
	url: string;
}

export type QueueItem = Optional<Song | Playlist> | Promise<Optional<Song | Playlist>>;

export class Playlist {
	private url: string;
	private name: string;
	private list: Array<Song>;

	constructor(ulr: string, name: string){
		this.url = ulr;
		this.name = name;
		this.list = [];
	}

	public getUrl(): string {
		return this.url;
	}

	public getName(): string {
		return this.name; 
	}

	public getList(): Array<Song> {
		return this.list;
	}
    
	public empty(): boolean {
		return this.list.length === 0;
	}

	public pop(): Optional<Song | undefined>{
		return Some(this.list.pop());
	}

	public add(song: Song) {
		this.list.push(song);
	}
}

export function instanceOfSong(object: any): boolean {
	if (typeof object === "object"){
		return "title" in object && "url" in object;
	}
    
	return false;
}
