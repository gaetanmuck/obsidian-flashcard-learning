import { App, PluginSettingTab, Setting } from 'obsidian';
import { Deck } from './model/deck';
import FlashcardLearningPlugin from './main';
import { Flashcard } from './model/flashcard';
import { FlashcardLearningSettings } from './model/settings';
import { ConfirmModal } from './modals/confirm';
import { updateFlashcards } from './tools';


export const DEFAULT_SETTINGS: FlashcardLearningSettings = {
    defaultLevel: 0,
    decks: [new Deck('No deck')],
    wrongStepBack: 5
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

        // Reset progress 
        new Setting(containerEl)
            .setName('Reset all progress')
            .setDesc('Be carefull, this action will erase all levels, and all progress you have in this vault')
            .addButton(button => button
                .setButtonText('Reset learning')
                .setCta()
                .onClick(() => {
                    // Goes through a confirmation modal
                    new ConfirmModal(this.app, answer => {
                        if (!answer) return;

                        // Fetch, update and write all Flascards in all files in an async and parallel way
                        this.plugin.app.vault.getMarkdownFiles().map(async file => {
                            const lines = (await this.app.vault.read(file)).split('\n');
                            let updated = false;
                            lines.forEach((line, i) => {
                                if (line.startsWith('FLASHCARD')) {
                                    const fc = Flashcard.fromString(file, i, this.plugin.settings.decks, line);
                                    fc.reset();
                                    lines[i] = fc.toString();
                                    updated = true;
                                }
                            })
                            // We only write each file at most once, no need to rewrite for each updated flashcard
                            if (updated) this.plugin.app.vault.modify(file, lines.join('\n'));
                        })
                    }).open()
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
                    // Save settings on change
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
                    // Save settings on change
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
                    // Save settings on change: by default, just create a "New Deck". User has to update name to customize.
                    this.plugin.settings.decks.push(new Deck('New Deck'));
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                })
            )

        // Existing Decks
        const decksContainer = containerEl.createDiv();
        decksContainer.addClasses(['p-l-30px', 'p-y-10px'])

        this.plugin.settings.decks.forEach((deck, i) => {

            const deckRow = decksContainer.createDiv()
            deckRow.addClasses(['row-space-around', 'w-100pct']);

            // 'Witness' variables, to know if something has changed for each deck
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
                        // On change, we allow user to save action
                        newName = value;
                        saveButton.toggleVisibility(true);
                    })
                )

                // Delete button
                .addButton(button => button
                    .setButtonText('Delete deck')
                    .setTooltip('Delete only the deck, not the flashcards (they will be set to \'No deck\')')
                    .onClick(() => {
                        // On change, we allow user to save action
                        deleteDeck = true;
                        saveButton.toggleVisibility(true);
                    })
                )

                // Reset progress button
                .addButton(button => button
                    .setButtonText('Reset progress')
                    .setTooltip('Reset all progress')
                    .onClick(() => {
                        // On change, we allow user to save action
                        resetProgress = true;
                        saveButton.toggleVisibility(true);
                    })
                )


            // When an action has been made on a deck, 
            // First allow user to save his change,
            // Then call the write function
            const saveButton = deckRow.createEl('button');
            saveButton.addClasses(['bg-red'])
            saveButton.setText('Save')
            saveButton.toggleVisibility(false); // By default, nothing has changed, so we keep button hidden
            saveButton.onClickEvent(async () => {
                saveButton.disabled = true;

                // If name has changed
                if (newName) {
                    // Update flashcards
                    await updateFlashcards(this.app.vault, this.plugin.settings.decks, deck, (fc: Flashcard) => {
                        return fc.toString().replace('FLASHCARD - ' + deck.name, 'FLASHCARD - ' + newName)
                    });

                    // Update settings
                    deck.name = newName;
                    this.plugin.saveData(this.plugin.settings);
                }

                // If delete button has been clicked
                if (deleteDeck) {
                    // Update flashcards
                    await updateFlashcards(this.app.vault, this.plugin.settings.decks, deck, (fc: Flashcard) => {
                        return fc.toString().replace('FLASHCARD - ' + deck.name, 'FLASHCARD - No Deck')
                    })

                    // Update settings
                    this.plugin.settings.decks.splice(i, 1);
                    this.plugin.saveData(this.plugin.settings);
                }

                // If reset progress has been clicked
                if (resetProgress) {
                    // Update flashcards
                    await updateFlashcards(this.app.vault, this.plugin.settings.decks, deck, (fc: Flashcard) => {
                        fc.reset();
                        return fc.toString();
                    })

                    // Update settings
                    deck.reviewIndex = 0;
                    this.plugin.saveData(this.plugin.settings);
                }

                saveButton.disabled = false;
                saveButton.toggleVisibility(false);
            })
        })
    }
}