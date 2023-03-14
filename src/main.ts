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
        const ribbonIcon = this.addRibbonIcon('book', 'Review flashcards',() => {
            new HomeModal(this.app, this).open()
        })


		// Editor commands to create flashcard
		this.addCommand({
			id: 'create-flashcard',
			name: 'Create new Flascard',
			editorCallback: (editor: Editor, view: MarkdownView) => {
                new CreateFlashcardModal(this.app, this.settings, editor.getCursor().line, (fc1: Flashcard, fc2: Flashcard) => {
                    editor.replaceSelection('\n')
                    editor.replaceSelection(fc1.toString())
                    editor.replaceSelection('\n')
                    editor.replaceSelection(fc2.toString())
                }).open()
			}
		});

    }

    async onunload() {
        
    }

}