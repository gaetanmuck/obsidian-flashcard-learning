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
        const ribbonIcon = this.addRibbonIcon('book', 'Review flashcards', () => {
            new HomeModal(this.app, this).open()
        })


        // Editor commands to create flashcard
        this.addCommand({
            id: 'create-flashcard',
            name: 'Create new flashcard',
            editorCallback: (editor: Editor, view: MarkdownView) => {

                // Parse params
                const value = editor.getValue()
                const beginParamIdx = value.indexOf('---') + 4
                const endParamIdx = value.indexOf('---', beginParamIdx)
                const paramsStr = value.substring(beginParamIdx, endParamIdx)
                const paramsArr = paramsStr.split('\n')

                const defaults = { deck:'', side1_desc: '', side1: '', side2_desc: '', side2: '', level: this.settings.defaultLevel + ''}
                for (let i = 0; i < paramsArr.length; i++) {
                    const varName = paramsArr[i].substring(0, paramsArr[i].indexOf(':'))
                    const varValue = paramsArr[i].substring(paramsArr[i].indexOf(':') + 1).trim()
                    if (Object.keys(defaults).includes(varName)) 
                        defaults[varName as 'deck' | 'side1_desc' | 'side1' | 'side2_desc' | 'side2' | 'level'] = varValue
                }


                new CreateFlashcardModal(this.app, this.settings, editor.getCursor().line, defaults, (fc1: Flashcard, fc2: Flashcard) => {
                    editor.replaceSelection('\n' + fc1.toString() + '\n' + fc2.toString())
                }).open()
            }
        });

    }

    async onunload() {

    }

}
