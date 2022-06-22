export const unknownCommand = "Tento příkaz neznám.";
export const executeError = "Nastala chyba při vykonávání příkazu.";
export const notValidURL = "Tato adresa není validní.";
export const songAdded = "Písnička byla přidána do fronty.";
export const songSkipped = "Písnička byla přeskočena.";
export const songPaused = "Písnička byla pozastavena.";
export const memeberNotConnected = "Musíš být ve hlasovém kanále.";
export const emptyQueue = "Fronta je prázdná.";

export const errorSkip = "Nastala chyba při přeskakování písničky.";
export const errorPause = "Nastala chyba při pozastavování písničky.";
export const errorConnection = "Nastala chyba při připojení.";

export const CommandPing = {
	name: "ping",
	description: "pošli ping botovi",
};

export const CommandPlay = {
	name: "play",
	description: "pusť si svou oblíbenou hudbu",
	options: [
		{
			name: "odkaz",
			description: "Odkaz na YT video nebo playlist."
		}
	]
};

export const CommandPause = {
	name: "pause",
	description: "zastav aktuálně přehranou písničku",
};

export const CommandSkip = {
	name: "skip",
	description: "přeskoč aktuálně přehranou písničku",
};

