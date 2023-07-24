import { TFile, Vault } from 'obsidian';

export class Flashcard {

    // Localization
    file: TFile | undefined;
    lineNb: number | undefined;

    // Card info
    level: number;
    nextReview: number;
    deck: string;
    side1: string;
    side1Desc: string;
    side2: string;
    side2Desc: string;

    // Problem flag;
    malformed: false | string;


    constructor(level: number, reviewIndex: number, deck: string | undefined,  side1Desc: string, side1: string, side2Desc: string, side2: string, file?: TFile, lineNb?: number) {

        // Check mandatories information
        if (side1 === undefined) throw new Error('side1 is not defined')
        if (side2 === undefined) throw new Error('side2 is not defined')
        if (level === undefined) throw new Error('Level is not defined')

        // About localization
        this.file = file;
        this.lineNb = lineNb;

        // Card infos
        this.deck = deck ?? 'No deck';
        this.side1 = side1;
        this.side1Desc = side1Desc;
        this.side2 = side2;
        this.side2Desc = side2Desc;
        this.level = level
        this.nextReview = reviewIndex

        // With the constructor, if can not be malformed
        this.malformed = false;
    }

    toString() {
        return `🃟 Flaschcard: (${this.level}, ${this.nextReview}, ${this.deck}) (${this.side1Desc}: ${this.side1}) (${this.side2Desc}: ${this.side2})`
    } 

    static isStrAFlashcard(str: string): Boolean {
        if (str.startsWith('🃟 Flaschcard:')
            || str.startsWith('FLASHCARD - ')) // Handle deprecated version of flashcard learning. To be deleted in next versions
            return true
        return false
    }

    static fromString(file: TFile, lineNb: number, str: string): Flashcard {

        // Handle deprecated version of flashcard learning. To be deleted in next versions
        if (str.startsWith('FLASHCARD - ')) {
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

                const deck = elements[0]
                // elements[4] => Recto => side1
                // elements[3] => RectoDesc => side1Desc
                // elements[6] => Verso => side2
                // elements[5] => VersoDesc => side2Desc
                // elements[1] => lvl => lvl
                return new Flashcard(parseInt(elements[1]), 0, deck, elements[3], elements[4], elements[5], elements[6], file, lineNb)

            } catch (e) {
                // If the flashcard string is malformed, we add a flag string in the end, so the user knows it
                const flashcard = new Flashcard(-2, -2, undefined, '', '', '', '', file, lineNb)
                flashcard.malformed = '❌️' + str.replace(' ### Malformed flashcard ###', '')
                return flashcard;
            }
        } else {
            try {

                let infos = str.replace('🃟 Flaschcard:', '').trim()
                const metaPart = infos.substring(0, infos.indexOf(')') + 1).trim()
                infos = infos.replace(metaPart, '').trim()
                const side1Part = infos.substring(0, infos.indexOf(')') + 1).trim()
                infos = infos.replace(side1Part, '').trim()
                const side2Part = infos.substring(0, infos.indexOf(')') + 1).trim()

                // Meta part
                const metaSplited = metaPart.substring(1, metaPart.length - 1).split(',')
                const lvl = parseInt(metaSplited[0].trim())
                const reviewIndex = parseInt(metaSplited[1].trim())
                const deck = metaSplited[2].trim()

                // Side 1 part
                const part1Splited = side1Part.substring(1, side1Part.length - 1).split(':')
                const side1Desc = part1Splited[0].trim()
                const side1 = part1Splited[1].trim()

                // Side 2 part
                const part2Splited = side2Part.substring(1, side2Part.length - 1).split(':')
                const side2Desc = part2Splited[0].trim()
                const side2 = part2Splited[1].trim()

                return new Flashcard( lvl, reviewIndex, deck, side1Desc, side1, side2Desc, side2, file, lineNb)
            } catch (e) {
                // If the flashcard string is malformed, we add a flag string in the end, so the user knows it
                const flashcard = new Flashcard(-2, -2, undefined, '', '', '', '', file, lineNb)
                flashcard.malformed = '❌️' + str
                return flashcard;
            }
        }

    }


    reset(): string {
        this.level = -1;
        this.nextReview = 0;

        // Here we do not save the flashcard, in order to gain in performance:
        // Places where we use this function uses a batch modification,
        // in order to only update one file once, even if there is multiple flashcards in this file 

        return this.toString()
    }


    // When hitting 'Correct' button while reviewing a flashcard: change metadata of the card, and update file
    async wasCorrect(vault: Vault, currentIndex: number) {
        this.level++;
        this.nextReview = currentIndex + this.level;

        await this.save(vault)
    }


    // When hitting 'Wrong' button while reviewing a flashcard: change metadata of the card, and update file
    async wasWrong(vault: Vault) {
        this.level = 0;

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