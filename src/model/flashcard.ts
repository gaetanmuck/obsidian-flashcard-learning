import { TFile, Vault } from 'obsidian';
import { Deck } from './deck';

export class Flashcard {

    // Localisation
    file: TFile | undefined;
    lineNb: number | undefined;

    deck: Deck;
    recto: string;
    rectoDesc: string;
    verso: string;
    versoDesc: string;
    level: number;
    reviewIndex: number;

    malformed: false | string;

    constructor(deck: Deck | undefined, recto: string, rectoDesc: string, verso: string, versoDesc: string, level: number, reviewIndex = 0, file?: TFile, lineNb?: number) {
        if (recto === undefined) throw new Error('Recto is not defined')
        if (verso === undefined) throw new Error('Verso is not defined')
        if (level === undefined) throw new Error('Level is not defined')

        this.file = file;
        this.lineNb = lineNb;

        this.deck = deck ?? new Deck('No deck');
        this.recto = recto;
        this.rectoDesc = rectoDesc;
        this.verso = verso;
        this.versoDesc = versoDesc;
        this.level = level
        this.reviewIndex = reviewIndex

        this.malformed = false;
    }

    toString() {
        if (this.malformed) return this.malformed;

        // The deckname missing should only appear when someone changed a stringified flashcard manually
        const deckname = this.deck ? this.deck.name : 'No deck';
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
            const malformed = new Flashcard(undefined, '', '', '', '', -1, -1, file, lineNb)
            malformed.malformed = str.replace(' ### Malformed flashcard ###', '') + ' ### Malformed flashcard ###';
            return malformed
        }
    }

    async reset() {
        if (this.malformed) return;
        this.level = 0;
        this.reviewIndex = 0;
    }

    async wasCorrect(vault: Vault) {
        this.level++;
        this.reviewIndex = this.deck.reviewIndex + this.level;

        await this.save(vault)
    }

    async wasWrong(vault: Vault) {
        this.level = 0;
        this.reviewIndex = this.deck.reviewIndex;

        await this.save(vault)
    }

    async save(vault: Vault) {
        if (this.file != undefined && this.lineNb != undefined) {
            const lines = (await vault.read(this.file)).split('\n')
            lines[this.lineNb] = this.toString();
            await vault.modify(this.file, lines.join('\n'))
        }
    }
}