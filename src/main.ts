import { Plugin, Editor, MarkdownView } from 'obsidian'
import { CreateFlashcardModal } from './modals/create-flashcard';
import { HomeModal } from './modals/home';
import { Flashcard } from './model/flashcard';
import { FlashcardLearningSettings } from './model/settings';
import { DEFAULT_SETTINGS, FlashcardSettingTab } from './settings';


export default class FlashcardLearningPlugin extends Plugin {

    settings: FlashcardLearningSettings

    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        // Setting tab
        this.addSettingTab(new FlashcardSettingTab(this.app, this));

        // Ribbon icon
        const ribbonIcon = this.addRibbonIcon(
            'sheets-in-box', 
            'Review flashcards', 
            () => new HomeModal(this.app, this).open()
        )

        // Editor commands to create flashcard
        this.addCommand({
            id: 'create-flashcard',
            name: 'Create new flashcard',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                // Frontmatter of current file, so that the modal can load defaults
                const frontmatter = this.app.metadataCache.getFileCache(view.file)?.frontmatter
                new CreateFlashcardModal(this.app, frontmatter, editor.getCursor().line, (fc1: Flashcard, fc2: Flashcard) => {

                    // Write flashcards
                    editor.replaceSelection(fc1.toString() + '\n' + fc2.toString() + '\n')

                    if(frontmatter && !frontmatter?.flaschcard == undefined) {
                        // If there is a frontmatter, but not the flashcard prop, add the flashcard prop
                        // If flashcard prop exist and is false, it won't change anything
                        editor.replaceRange(
                            'flashcard: true\n',
                            {line: frontmatter.position.start.line + 1, ch: 0},
                            {line: frontmatter.position.start.line + 1, ch: 0},
                        )
                    } else if (!frontmatter) {
                        // If there is no frontmatter at all, creates it
                        editor.replaceRange(
                            '---\nflashcard: true\n---\n\n',
                            {line: 0, ch: 0},
                            {line: 0, ch: 0},
                        )
                    }
                }).open()
            }
        });

    }

    async onunload() { }

}
