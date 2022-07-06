export const unknownCommand = "Tento příkaz neznám.";
export const executeError = "Nastala chyba při vykonávání příkazu.";
export const songAdded = "Písnička byla přidána do fronty.";
export const songSkipped = "Písnička byla přeskočena.";
export const songPaused = "Písnička byla pozastavena.";
export const memeberNotConnected = "Musíš být ve hlasovém kanále.";
export const emptyQueue = "Fronta je prázdná.";
export const queueList = "Aktuální queue: ";
export const ppMessage = "Délka tvého pp je ";
export const shuffleSuccessful = "Playlist byl zamýchán.";

export const errorArg = "Neplatný argument.";
export const errorSpotifyAlbum = "Ze spotify lze načíst pouze playlist nebo písničku.";
export const errorSkip = "Nastala chyba při přeskakování písničky.";
export const errorShuffle = "Nastala chyba při mýchání.";
export const errorQuote = "Nastala chyba při hledání citátu.";
export const errorPause = "Nastala chyba při pozastavování písničky.";
export const errorConnection = "Nastala chyba při připojení.";
export const errorPlaylist = "Nastala chyba při parsování playlistu.";

export const CommandPing = {
	name: "ping",
	description: "Pošli ping botovi.",
};

export const CommandPlay = {
	name: "play",
	description: "Pusť si svou oblíbenou hudbu.",
	options: [
		{
			name: "search",
			description: "Odkaz na Youtube/libovolá fráze."
		}
	]
};

export const CommandQueue = {
	name: "queue",
	description: "Zobraz seznam skladeb.",
	options: [
		{
			name: "count",
			description: "Kolik písní chceš vypsat."
		}
	]
};

export const CommandPause = {
	name: "pause",
	description: "Zastav aktuálně přehranou písničku.",
};

export const CommandSkip = {
	name: "skip",
	description: "Přeskoč aktuálně přehranou písničku.",
	options: [
		{
			name: "count",
			description: "Kolik písní chceš přeskočit."
		}
	]
};

export const CommandShuffle = {
	name: "shuffle",
	description: "Zamýchej playlist nebo queue.",
};

export const CommandQuote = {
	name: "quote",
	description: "Vypíše ti náhodný citát z místnosti s citáty.",
};

export const CommandPP = {
	name: "pp",
	description: "Vypíše ti velikost pp.",
};

export const CommandBall = {
	name: "8ball",
	description: "Odpoví na tvou otázku.",
	options: [
		{
			name: "question",
			description: "Vlož velmi důležitou otázku a já ti odpovím."
		}
	],
	answers: [
		"Je to jisté.",
		"Ani o tom nepochybuji.",
		"Bezpochyby.",
		"Ano, určitě.",
		"Jasná páka.",
		"Hodil jsem si dvacetistěnkou a ta řekla 1.",
		"Hodil jsem si dvacetistěnkou a ta řekla 20.",
		"Jak to vidím já, tak ano.",
		"S největší pravděpodobností.",
		"Výhledově to vypadá dobře.",
		"Moje odpověď zní ... |Ano|!",
		"Příznaky nasvědčují tomu, že ano.",
		"Odpověď mlhavá, zkuste to znovu.",
		"Zeptejte se znovu později.",
		"Raďeji se o tom nebudeme bavit.",
		"Nelze nyní předvídat.",
		"Soustřeďte se a zeptejte se znovu.",
		"Nepočítejte s tím.",
		"Moje odpověď zní ... |Ne|!.",
		"Mé zdroje říkají ne.",
		"Vyhlídky nejsou tak dobré.",
		"Velmi o tom pochybuji.",
		"Ugh! Ne?",
		"Je to očividné. Nemyslíš?",
		"ano. ano! ANO!",
		"Ne! V žádném případě!",
		"Kdybych uměl emoty tak bych ti dropnul pogo.",
		"Zeptej se radši Anežky na takovou úchylárnu neznám odpověď.",
		"Prostě Sanctum. Odpověď na všechny otázky.",
	]
};
