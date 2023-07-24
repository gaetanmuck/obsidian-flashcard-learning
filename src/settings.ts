import { App, PluginSettingTab, Setting } from 'obsidian';
import FlashcardLearningPlugin from './main';
import { Flashcard } from './model/flashcard';
import { FlashcardLearningSettings } from './model/settings';
import { ConfirmModal } from './modals/confirm';


export const DEFAULT_SETTINGS: FlashcardLearningSettings = {
    newCardNbOnReview: 1,
    reviewIndex: 0
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
            .setDesc('Be carefull, this action will erase all progress (ie. cards level and review indexes).')
            .addButton(button => button
                .setButtonText('Reset learning')
                .setCta()
                .onClick(() => {
                    // Goes through a confirmation modal
                    new ConfirmModal(this.app, answer => {
                        if (!answer) return;

                        // Fetch, update and write all Flascards in all files in an async and parallel way
                        this.plugin.app.vault.getMarkdownFiles()
                            .filter(file => this.app.metadataCache.getFileCache(file)?.frontmatter?.flashcard)
                            .map(async file => {
                                let needToSave = false;

                                // Get the lines (needed to remember which line a str is for replacement)
                                const lines = (await this.app.vault.read(file)).split('\n')
                                lines.forEach((line, i) => {

                                    // Is it a flashcard?
                                    if (Flashcard.isStrAFlashcard(line)) {
                                        needToSave = true

                                        // Parse flashcard
                                        const flashcard = Flashcard.fromString(file, i, line)

                                        // If parsing went well, adds it, otherwise, replace the string
                                        if (flashcard.malformed) lines[i] = flashcard.malformed
                                        else lines[i] = flashcard.reset()
                                    }
                                })

                                // We only write each file at most once, 
                                // no need to rewrite for each updated flashcard
                                if (needToSave) this.plugin.app.vault.modify(file, lines.join('\n'));
                            })
                    }).open()
                })
            )

        new Setting(containerEl)
            .setName('New cards added each review')
            .setDesc('If you have new cards in your vault, this number will be added to the next review from those new cards')
            .addText(text =>
                text
                    .setPlaceholder("1")
                    .setValue(this.plugin.settings.newCardNbOnReview + '')
                    .onChange(async value => {
                        const parsed = parseInt(value)
                        if (parsed) {
                            this.plugin.settings.newCardNbOnReview = parsed;
                            await this.plugin.saveData(this.plugin.settings)
                        }
                    })
            );
    }
}