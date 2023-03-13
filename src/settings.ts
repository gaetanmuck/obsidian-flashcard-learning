import { App, PluginSettingTab, Setting } from 'obsidian';
import { Deck } from './model/deck';
import FlashcardLearningPlugin from './main';
import { Flashcard } from './model/flashcard';
import MyPlugin from 'main_old';


export interface FlashcardLearningSettings {
    defaultLevel: number;
    decks: Array<Deck>;
    wrongStepBack: number;
    side1_int: string | undefined;
    side2_int: string | undefined;
}


export const DEFAULT_SETTINGS: FlashcardLearningSettings = {
    defaultLevel: 0,
    decks: [new Deck('No deck')],
    wrongStepBack: 5,
    side1_int: undefined,
    side2_int: undefined
}


export class FlashcardSettingTab extends PluginSettingTab {

    plugin: FlashcardLearningPlugin;

    constructor(app: App, plugin: FlashcardLearningPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        // Title
        containerEl.createEl('h1', { text: 'Flashcard Learning settings' });

        // Progress 
        new Setting(containerEl)
            .setName('Reset all progress')
            .setDesc('Be carefull, this action will erase all levels, and all progress you have on this vault')
            .addButton(button => button
                .setButtonText('Reset learning')
                .setCta()
                .onClick(() => {
                    // Fetch, update and write all Flascards in all files in an async and parallel way
                    this.plugin.app.vault.getMarkdownFiles().map(async file => {
                        const lines = (await this.app.vault.read(file)).split('\n');
                        lines.forEach((line, i) => {
                            if (line.startsWith('FLASHCARD')) {
                                const fc = Flashcard.fromString(file, i, this.plugin.settings.decks, line);
                                fc.reset();
                                lines[i] = fc.toString();
                            }
                        })
                        this.plugin.app.vault.modify(file, lines.join('\n'));
                    })
                })
            )

        // Default level
        new Setting(containerEl)
            .setName('Default level')
            .setDesc('Will be attributed to newly created Flashcards (using the helper).')
            .addText(text => text
                .setPlaceholder('Set your level')
                .setValue(this.plugin.settings.defaultLevel + '')
                .onChange(async value => {
                    this.plugin.settings.defaultLevel = isNaN(Number(value)) ? 0 : Number(value);
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                }));


        // Wrong step back
        new Setting(containerEl)
            .setName('Wrong step back')
            .setDesc('Will move wrong answers this number back in the stack.')
            .addText(text => text
                .setPlaceholder('Set your Wrong step back')
                .setValue(this.plugin.settings.wrongStepBack + '')
                .onChange(async value => {
                    this.plugin.settings.wrongStepBack = isNaN(Number(value)) ? 0 : Number(value);
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                }));

        // New Decks
        new Setting(containerEl)
            .setName('Deck list')
            .setDesc('Set the list of decks that you can chose in the Flashcard helper.')
            .addButton(button => button
                .setButtonText('Add a new deck')
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.decks.push(new Deck('New Deck'));
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                })
            )

        const deckContainer = containerEl.createDiv();
        deckContainer.addClasses(['p-l-30px', 'p-y-10px'])

        // Existing Decks
        this.plugin.settings.decks.forEach((deck, i) => {

            const deckRow = deckContainer.createDiv()
            deckRow.addClasses(['row-space-around', 'w-100pct']);


            let newName: string = '';
            let deleteDeck = false;
            let resetProgress = false;

            new Setting(deckRow)
                .setName('Deck ' + (i + 1))
                .setDesc('Reviewed: ' + deck.reviewIndex)

                // Deck name text field
                .addText(text => text
                    .setValue(deck.name)
                    .onChange(async value => {
                        newName = value;
                        saveButton.toggleVisibility(true);
                    })
                )

                // Delete button
                .addButton(button => button
                    .setButtonText('Delete deck')
                    .setTooltip('Delete only the deck, not the flashcards (they will be set to \'No deck\')')
                    .onClick(() => {
                        deleteDeck = true;
                        saveButton.toggleVisibility(true);
                    })
                )

                // Reset progress button
                .addButton(button => button
                    .setButtonText('Reset progress')
                    .setTooltip('Reset all progress')
                    .onClick(() => {
                        resetProgress = true;
                        saveButton.toggleVisibility(true);
                    })
                )

            const saveButton = deckRow.createEl('button');
            saveButton.setText('Save')
            saveButton.toggleVisibility(false);
            saveButton.onClickEvent(async () => {
                saveButton.disabled = true;

                if (newName) await this.replaceDeckName(deck, newName);
                if (deleteDeck) await this.deleteDeck(deck, i);
                if (resetProgress) await this.resetProgress(deck);

                saveButton.disabled = false;
                saveButton.toggleVisibility(false);
            })
        })
    }

    async replaceDeckName(deck:Deck, newName: string) {
        // Fetch, update and write all Flascards in all files in an async and parallel way
        await Promise.all(
            this.plugin.app.vault.getMarkdownFiles().map(async file => {
                const lines = (await this.app.vault.read(file)).split('\n');
                let changeFound = false;
                lines.forEach((line, j) => {
                    if (line.startsWith('FLASHCARD')) {
                        const fc = Flashcard.fromString(file, j, this.plugin.settings.decks, line);
                        if (fc.deck == deck) {
                            lines[j] = fc.toString().replace('FLASHCARD - ' + deck.name, 'FLASHCARD - ' + newName)
                            changeFound = true;
                        }
                    }
                })
                if (changeFound) await this.plugin.app.vault.modify(file, lines.join('\n'));
            })
        )

        // Update settings
        deck.name = newName;
        this.plugin.saveData(this.plugin.settings);
    }

    async deleteDeck(deck: Deck, index: number) {
        // Fetch, update and write all Flascards in all files in an async and parallel way
        await Promise.all(
            this.plugin.app.vault.getMarkdownFiles().map(async file => {
                const lines = (await this.app.vault.read(file)).split('\n');
                let changeFound = false;
                lines.forEach((line, j) => {
                    if (line.startsWith('FLASHCARD')) {
                        const fc = Flashcard.fromString(file, j, this.plugin.settings.decks, line);
                        if (fc.deck == deck) {
                            lines[j] = fc.toString().replace('FLASHCARD - ' + deck.name, 'FLASHCARD - No Deck')
                            changeFound = true;
                        }
                    }
                })
                if (changeFound) await this.plugin.app.vault.modify(file, lines.join('\n'));
            })
        )

        // Update settings
        this.plugin.settings.decks.splice(index, 1);
        this.plugin.saveData(this.plugin.settings);
    }

    async resetProgress(deck: Deck) {
        // Fetch, update and write all Flascards in all files in an async and parallel way
        await Promise.all(
            this.plugin.app.vault.getMarkdownFiles().map(async file => {
                const lines = (await this.app.vault.read(file)).split('\n');
                let changeFound = false;
                lines.forEach((line, j) => {
                    if (line.startsWith('FLASHCARD')) {
                        const fc = Flashcard.fromString(file, j, this.plugin.settings.decks, line);
                        if (fc.deck === deck) {
                            fc.reviewIndex = 0;
                            fc.level = 0;
                            lines[j] = fc.toString();
                            changeFound = true;
                        }
                    }
                })
                if (changeFound) await this.plugin.app.vault.modify(file, lines.join('\n'));
            })
        )

        // Update settings
        deck.reviewIndex = 0;
        this.plugin.saveData(this.plugin.settings);
    }
}