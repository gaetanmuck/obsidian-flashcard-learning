import { Vault } from 'obsidian';
import { Deck } from './model/deck';
import { Flashcard } from './model/flashcard';


// Execute an action function on all flashcards from a specified Deck
export async function updateFlashcards(vault: Vault, decks: Array<Deck>, deck: Deck, action: (fc: Flashcard) => string) {
    // Fetch, update and write all Flascards in all files in an async and parallel way
    await Promise.all(
        // Go through all the files
        vault.getMarkdownFiles().map(async file => {
            // And each lines
            const lines = (await vault.read(file)).split('\n');
            let change = false;

            // If the line has the correct begining, it is flashcard
            lines.forEach((line, j) => {
                if (line.startsWith('FLASHCARD')) {
                    const fc = Flashcard.fromString(file, j, decks, line);

                    // Only the ones that are in the right deck
                    if (fc.deck == deck) {
                        const newStr = action(fc);
                        if (newStr != line) {
                            lines[j] = newStr;
                            change = true;
                        }
                    }
                }
            })

            // Only write changed files
            if (change) await vault.modify(file, lines.join('\n'));
        })
    )
}