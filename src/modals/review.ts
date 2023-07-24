import { Modal, App, Setting, FileManager } from 'obsidian';
import FlashcardLearningPlugin from 'src/main';
import { Flashcard } from 'src/model/flashcard';
import { HomeModal } from './home';
import { FlashcardLearningSettings } from 'src/model/settings';

export class ReviewModal extends Modal {

    plugin: FlashcardLearningPlugin

    reviewIndex: number;
    flashcards: Array<Flashcard> = []
    toReview: Array<Flashcard> = []

    container: HTMLDivElement

    constructor(app: App, plugin: FlashcardLearningPlugin, allFlashcards: Array<Flashcard>) {
        super(app)
        this.plugin = plugin
        this.reviewIndex = plugin.settings.reviewIndex
        this.flashcards = allFlashcards

        this.modalEl.addClasses(['h-80pct', 'w-80pct', 'max-w-500px'])
    }


    onOpen() {
        // Filter flashcards
        this.toReview = this.flashcards
            .filter(fc => fc.nextReview <= this.reviewIndex) // Take all due
            .filter(fc => fc.level >= 0) // Except not planned new ones (ie lvl==-1)

        // Prepare html
        this.contentEl.createEl('h1', { text: `🤔 Flashcard Review #${this.plugin.settings.reviewIndex}` });

        // Load first flashcard review
        this.displayNextFlashcard();
    }


    onClose() {
        const { contentEl } = this;
        contentEl.empty();

        // Go back to home modal
        new HomeModal(this.app, this.plugin).open()
    }

    reviewFinished() {
        // Save progress 
        this.plugin.settings.reviewIndex++;
        this.plugin.saveData(this.plugin.settings);

        // If there is not yet learned flashcards, prepare (randomnly) a certain number for next review
        const newFlashcards: Array<Flashcard> = []
        const pool: Array<Flashcard> = this.flashcards.filter(fc => fc.level == -1)
        if (pool.length > 0) {
            for (let i = 0; i < this.plugin.settings.newCardNbOnReview; i++) {
                const fc = pool[Math.floor(Math.random() * pool.length)]
                fc.level = 0
                fc.nextReview = this.plugin.settings.reviewIndex
                fc.save(this.plugin.app.vault)
                console.log('New Card added:', fc.toString())
            }
        }

        // Congratulation container
        const box = this.container.createDiv();
        box.addClasses(['col-space-around', 'w-100pct', 'h-100pct'])

        // Display congratulations
        const box_row1 = box.createDiv();
        box_row1.addClasses(['row-center', 'w-100pct'])
        box_row1.createSpan({ text: '👏👏👏' });
        const box_row2 = box.createDiv();
        box_row2.addClasses(['row-center', 'w-100pct'])
        box_row2.createSpan({ text: 'Congratulation, you went through your review!' });
        const box_row3 = box.createDiv();
        box_row3.addClasses(['row-center', 'w-100pct'])
        box_row3.createSpan({ text: '👏👏👏' });

        // Validation button
        const btn_container = this.container.createDiv();
        btn_container.addClasses(['row-center']);
        const btn = btn_container.createEl('button', { text: 'Close' });
        btn.addClasses(['w-50pct'])
        btn.onClickEvent(() => this.close());
    }


    displayNextFlashcard() {

        // Prepare

        // init global container
        if (this.container) this.container.remove();
        this.container = this.contentEl.createDiv();
        this.container.addClasses(['h-90pct', 'col-space-between'])

        // When all due Flashcards has been reviewed
        if (this.toReview.length == 0) return this.reviewFinished()

        // The current flashcard to review (randomnly picked from the queue)
        const flashcard = this.toReview[Math.floor(Math.random() * this.toReview.length)];


        // Flashcard information

        const infos = this.container.createDiv();
        infos.addClasses(['col-space-around', 'p-y-10px']);
        // Line Deck and Left number
        const line1 = infos.createDiv();
        line1.addClasses(['row-space-between'])
        // Deck
        const deck_html = line1.createDiv({ text: `📦 ${flashcard.deck}` })
        deck_html.addClasses(['nowrap', 'max-w-60pct', 'overflow-hidden', 'p-5px']);
        // Number left
        const number_html = line1.createDiv({ text: `⏲️ ${this.toReview.length} left`, cls: 'nowrap' })
        number_html.addClasses(['nowrap', 'max-w-100pct', 'overflow-hidden', 'p-5px']);
        // Line File and Level
        const line2 = infos.createDiv();
        line2.addClasses(['row-space-between'])
        // File
        const file_html = line2.createSpan({ text: `📁 ${flashcard.file?.basename}`, cls: 'nowrap' })
        file_html.addClasses(['nowrap', 'max-w-60pct', 'overflow-hidden', 'p-5px']);
        // Level
        const level_html = line2.createDiv({ text: `🆙 Level ${flashcard.level}` })
        level_html.addClasses(['nowrap', 'p-5px']);


        // Side 1

        const front = this.container.createDiv();
        front.addClasses(['col-space-between', 'w-100pct', 'flex-grow', 'box', 'm-y-10px'])

        const front_row_desc = front.createDiv()
        front_row_desc.addClasses(['row-start', 'w-100pct', 'p-10px'])
        front_row_desc.createSpan({ text: flashcard.side1Desc + ':' })

        const front_row_content = front.createDiv()
        front_row_content.addClasses(['row-center', 'w-100pct', 'p-10px', 'txt-center', 'overflow-hidden'])
        front_row_content.createSpan({ text: flashcard.side1 })

        const front_placeholder = front.createDiv()
        front_placeholder.addClasses(['p-10px', 'invisible'])
        front_placeholder.createSpan({ text: 'placeholder' })


        // Side 2

        const back = this.container.createDiv();
        back.addClasses(['col-space-between', 'w-100pct', 'flex-grow', 'box', 'm-y-10px'])

        const back_row_desc = back.createDiv()
        back_row_desc.addClasses(['row-start', 'w-100pct', 'p-10px'])
        back_row_desc.createSpan({ text: flashcard.side2Desc + ':' })

        const back_row_content = back.createDiv()
        back_row_content.addClasses(['row-center', 'w-100pct', 'p-10px', 'txt-center', 'overflow-hidden'])
        let answer = back_row_content.createSpan({ text: '❓' })

        const back_placeholder = back.createDiv()
        back_placeholder.addClasses(['p-10px', 'invisible'])
        back_placeholder.createSpan({ text: 'placeholder' })


        // Commands

        const commands_container = this.container.createDiv();
        commands_container.addClasses(['w-100pct', 'row-center'])

        const showAnswer = commands_container.createEl('button', { text: '👀 Show answer' });
        showAnswer.addClasses(['w-33pct', 'txt-bold', 'visible', 'btn-height'])
        showAnswer.onClickEvent(() => {
            // Show answer
            answer.remove();
            answer = back_row_content.createSpan({ text: flashcard.side2 });

            // Hide Show button
            showAnswer.removeClass('visible');
            showAnswer.addClass('hidden');
            commands_container.removeClass('row-center');

            // Show response buttons
            wrongBtn.removeClass('hidden');
            wrongBtn.addClass('visible');
            correcBtn.removeClass('hidden');
            correcBtn.addClass('visible');
            commands_container.addClass('row-space-around');
        })

        // Wrong button
        const wrongBtn = commands_container.createEl('button', { text: '✖️ Wrong' });
        wrongBtn.addClasses(['w-33pct', 'bg-red', 'txt-bold', 'hidden', 'max-w-33pct', 'btn-height'])
        wrongBtn.onClickEvent(() => {
            console.log('Before Wrong:', flashcard.toString())
            flashcard.wasWrong(this.app.vault);
            console.log('After Wrong:', flashcard.toString())

            this.displayNextFlashcard();
        })

        // Correct button
        const correcBtn = commands_container.createEl('button', { text: '✔️ Correct' });
        correcBtn.addClasses(['w-33pct', 'bg-green', 'txt-dark', 'txt-bold', 'hidden', 'max-w-33pct', 'btn-height']);
        correcBtn.onClickEvent(async () => {

            console.log('Before Correct:', flashcard.toString())
            await flashcard.wasCorrect(this.app.vault, this.plugin.settings.reviewIndex);
            console.log('After Correct:', flashcard.toString())

            // When answer was correct, remove it from queue
            this.toReview.remove(flashcard)
            this.displayNextFlashcard();
        })
    }

}