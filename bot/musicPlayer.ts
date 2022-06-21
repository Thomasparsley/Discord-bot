import { VoiceConnectionStatus } from "@discordjs/voice";
import { InternalDiscordGatewayAdapterCreator, VoiceBasedChannel } from "discord.js";

const { joinVoiceChannel } = require('@discordjs/voice');

export class MusicPlayer {
    private playerConnection: PlayerConnection | null;
    private songs: Array<Song>;
    private volume: number;

    constructor(){
        this.playerConnection = null;
        this.volume = 5;
        this.songs = [];
    }

    public isConnected() : boolean {
        console.log(this.playerConnection);
        return (this.playerConnection) ? true : false;
    }

    public playerConnect(voicechannel: VoiceBasedChannel) {
        this.playerConnection = new PlayerConnection(
                voicechannel.id, 
                voicechannel.guild.id, 
                voicechannel.guild.voiceAdapterCreator)
    }
} 

class PlayerConnection {
    private connection: any; 

    constructor (channelId: string, guildId: string, adapterCreator: InternalDiscordGatewayAdapterCreator){
        this.connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: adapterCreator,
        });

        this.initSignalling();
        this.initConnecting();
        this.initReady();
        this.initDisconnected();
        this.initDestroyed();
    }

    private initSignalling() {
        this.connection.on(VoiceConnectionStatus.Signalling, () => {
            console.log('The connection has entered the Signalling state.');
        });
    }

    private initConnecting() {
        this.connection.on(VoiceConnectionStatus.Connecting, () => {
            console.log('The connection has entered the Connecting state.');
        });
    }

    private initReady() {
        this.connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The connection has entered the Ready state - ready to play audio!');
        });
    }

    private initDisconnected() {
        this.connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('The connection has entered the Ready Disconnected.');
        });
    }

    private initDestroyed() {
        this.connection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log('The connection has entered the Ready Destroyed.');
        });
    }

    public destroy() {
        this.connection.destroy();
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