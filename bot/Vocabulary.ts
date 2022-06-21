export const unknownCommand = "Tento příkaz neznám.";
export const executeError = "Nastala chyba při vykonávání příkazu.";
export const memeberNotConnected = "Musíš být ve hlasovém kanále.";
export const notValidURL = "Tato adresa není validní.";
export const songAdded = "Písnička byla přidána do fronty.";
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
