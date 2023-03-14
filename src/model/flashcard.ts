import { TFile, Vault } from 'obsidian';
import { Deck } from './deck';

export class Flashcard {

    // Localization
    file: TFile | undefined;
    lineNb: number | undefined;

    // Card info
    deck: Deck;
    recto: string;
    rectoDesc: string;
    verso: string;
    versoDesc: string;
    level: number;
    reviewIndex: number;

    // Problem flag;
    malformed: false | string;


    constructor(deck: Deck | undefined, recto: string, rectoDesc: string, verso: string, versoDesc: string, level: number, reviewIndex = 0, file?: TFile, lineNb?: number) {

        // Check mandatories information
        if (recto === undefined) throw new Error('Recto is not defined')
        if (verso === undefined) throw new Error('Verso is not defined')
        if (level === undefined) throw new Error('Level is not defined')

        // About localization
        this.file = file;
        this.lineNb = lineNb;

        // Card infos
        this.deck = deck ?? new Deck('No deck');
        this.recto = recto;
        this.rectoDesc = rectoDesc;
        this.verso = verso;
        this.versoDesc = versoDesc;
        this.level = level
        this.reviewIndex = reviewIndex

        // With the constructor, if can not be malformed
        this.malformed = false;
    }

    toString() {
        // If the card is malformed, the malformed string is stored in this variable
        if (this.malformed) return this.malformed;

        // If the deck name in the flashcard does not exist as a Deck in the settings
        const deckname = this.deck ? this.deck.name : 'No deck';
        // This could only occur when user updated stringified card manually directly in the file.

        return `FLASHCARD - ${deckname} - lvl ${this.level} - review index ${this.reviewIndex}: ${this.rectoDesc}->${this.recto} ? ${this.versoDesc}->${this.verso}`
    }

    static fromString(file: TFile, lineNb: number, decks: Array<Deck>, str: string): Flashcard {
        try {
            const elements = str
                .replace('FLASHCARD - ', '')
                .replace(' - lvl ', '///')
                .replace(' - review index ', '///')
                .replace(': ', '///')
                .replace('->', '///')
                .replace(' ? ', '///')
                .replace('->', '///')
                .trim()
                .replace(' ### Malformed flashcard ###', '')
                .split('///')

            const deck = decks.find(d => d.name == elements[0])
            return new Flashcard(deck, elements[4], elements[3], elements[6], elements[5], parseInt(elements[1]), parseInt(elements[2]), file, lineNb)

        } catch (e) {
            // If the flashcard string is malformed, we add a flag string in the end, so the user knows it
            const malformed = new Flashcard(undefined, '', '', '', '', -1, -1, file, lineNb)
            malformed.malformed = str.replace(' ### Malformed flashcard ###', '') + ' ### Malformed flashcard ###';
            return malformed;
        }
    }


    async reset() {
        if (this.malformed) return;
        this.level = 0;
        this.reviewIndex = 0;
    }


    // When hitting 'Correct' button while reviewing a flashcard
    async wasCorrect(vault: Vault) {
        this.level++;
        this.reviewIndex = this.deck.reviewIndex + this.level;

        await this.save(vault)
    }


    // When hitting 'Wrong' button while reviewing a flashcard
    async wasWrong(vault: Vault) {
        this.level = 0;
        this.reviewIndex = this.deck.reviewIndex;

        await this.save(vault)
    }


    // Save the Flashcard at the right place (line and file)
    async save(vault: Vault) {
        if (this.file != undefined && this.lineNb != undefined) {
            const lines = (await vault.read(this.file)).split('\n')
            lines[this.lineNb] = this.toString();
            await vault.modify(this.file, lines.join('\n'))
        }
    }
}