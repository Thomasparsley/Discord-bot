export class MusicPlayer {
    private connection: any;
    private playing: boolean;
    private songs: Array<Song>;
    private volume: number;

    constructor(connection: any){
        this.volume = 5;
        this.playing = false;
        this.songs = [];
    }
} 

export class Song {
    private title: string;
    private url: string;

    constructor(title: string, url: string) {
        this.title = title;
        this.url = url;
    }

    
    public getTitle() : string {
        return this.title;
    }
    
    
    public getUrl() : string {
        return this.url;
    }
}