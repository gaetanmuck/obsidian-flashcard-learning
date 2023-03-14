import { Modal, App, Setting, FileManager } from 'obsidian';
import FlashcardLearningPlugin from 'src/main';
import { Deck } from 'src/model/deck';
import { Flashcard } from 'src/model/flashcard';
import { HomeModal } from './home';

export class ReviewDeckModal extends Modal {

    plugin: FlashcardLearningPlugin;
    
    decks: Array<Deck> = [];
    flashcards: Array<Flashcard> = [];

    queue: Array<Flashcard> = [];
    
    container: HTMLDivElement;


    constructor(app: App, plugin: FlashcardLearningPlugin, allFlashcards: Array<Flashcard>, deckname: string) {
        super(app);
        this.plugin = plugin;
        this.flashcards = allFlashcards;

        // Select all the concerned decks
        if (deckname == 'all') this.decks = this.plugin.settings.decks;
        else {
            const deckTarget = this.plugin.settings.decks.find(d => d.name == deckname);
            if (deckTarget !== undefined) this.decks.push(deckTarget);
        }

        this.modalEl.addClasses(['h-80pct', 'w-80pct', 'max-w-500px'])
    }


    onOpen() {

        // Find the deck's Flashcards
        for (const deck of this.decks) {
            const selection = this.flashcards.filter(fc => fc.deck == deck);
            this.queue = this.queue.concat(selection.filter(fc => fc.reviewIndex <= deck.reviewIndex));
        }

        // Shuffle them
        this.queue = this.queue.sort((a, b) => 0.5 - Math.random());

        // Prepare html
        this.contentEl.createEl('h1', { text: "🤔 Flashcard Review" });

        // Load first flashcard review
        this.displayNextFlashcard();
    }


    onClose() {
        const { contentEl } = this;
        contentEl.empty();

        // Go back to home modal
        new HomeModal(this.app, this.plugin).open()
    }


    initGlobalContainer() {
        if (this.container) this.container.remove();

        this.container = this.contentEl.createDiv();
        this.container.addClasses(['h-90pct', 'col-space-between'])
    }


    displayNextFlashcard() {

        this.initGlobalContainer();

        if (this.queue.length == 0) {

            // Save the deck's progress
            this.decks.forEach(deck => deck.reviewIndex++);
            this.plugin.saveData(this.plugin.settings);

            // Congratulation container, when a review went through, ie queue.length == 0
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
            return;
        }


        // The current flashcard to review
        const flashcard = this.queue[0];


        // Flashcard information

        const infos = this.container.createDiv();
        infos.addClasses(['row-space-around', 'p-y-30px', 'm-y-10px']);
        // Deck
        const deck_html = infos.createSpan({ text: `📦 ${flashcard.deck.name}` })
        deck_html.addClasses(['nowrap', 'max-w-33pct', 'overflow-hidden']);
        // Level
        const level_html = infos.createSpan({ text: `🆙 Level ${flashcard.level}` })
        level_html.addClasses(['nowrap', 'max-w-33pct', 'overflow-hidden']);
        // File
        const file_html = infos.createSpan({ text: `📁 ${flashcard.file?.basename}`, cls: 'nowrap'})
        file_html.addClasses(['nowrap', 'max-w-33pct', 'overflow-hidden']);


        // Front side

        const front = this.container.createDiv();
        front.addClasses(['col-space-between', 'w-100pct', 'flex-grow', 'box', 'm-y-10px'])

        const front_row_desc = front.createDiv()
        front_row_desc.addClasses(['row-start', 'w-100pct', 'p-10px'])
        front_row_desc.createSpan({ text: flashcard.rectoDesc + ':' })

        const front_row_content = front.createDiv()
        front_row_content.addClasses(['row-center', 'w-100pct'])
        front_row_content.createSpan({ text: flashcard.recto })

        const front_placeholder = front.createDiv()
        front_placeholder.addClasses(['p-10px', 'invisible'])
        front_placeholder.createSpan({ text: 'placeholder'})


        // Back side

        const back = this.container.createDiv();
        back.addClasses(['col-space-between', 'w-100pct', 'flex-grow', 'box', 'm-y-10px'])

        const back_row_desc = back.createDiv()
        back_row_desc.addClasses(['row-start', 'w-100pct', 'p-10px'])
        back_row_desc.createSpan({ text: flashcard.versoDesc + ':' })

        const back_row_content = back.createDiv()
        back_row_content.addClasses(['row-center', 'w-100pct'])
        let answer = back_row_content.createSpan({ text: '❓' })

        const back_placeholder = back.createDiv()
        back_placeholder.addClasses(['p-10px', 'invisible'])
        back_placeholder.createSpan({ text: 'placeholder'})


        // Commands

        const commands_container = this.container.createDiv();

        const showAnswer = commands_container.createEl('button', { text: '👀 Show answer' });
        showAnswer.addClasses(['w-33pct', 'txt-bold', 'visible'])
        showAnswer.onClickEvent(() => {
            // Show answer
            answer.remove();
            answer = back_row_content.createSpan({ text: flashcard.verso });

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

        const wrongBtn = commands_container.createEl('button', { text: '✖️ Wrong' });
        wrongBtn.addClasses(['w-33pct', 'bg-red', 'txt-bold', 'hidden'])
        wrongBtn.onClickEvent(() => {
            flashcard.wasWrong(this.app.vault);

            // When a card is wrong, put it again in the queue, wrongStepBack behind
            this.queue.splice(this.plugin.settings.wrongStepBack, 0, flashcard);
            this.queue.shift();
            this.displayNextFlashcard();
        })

        const correcBtn = commands_container.createEl('button', { text: '✔️ Correct' });
        correcBtn.addClasses(['w-33pct', 'bg-green', 'txt-dark', 'txt-bold', 'hidden']);
        correcBtn.onClickEvent(() => {
            flashcard.wasCorrect(this.app.vault);

            // When answer was correct, remove it from queue
            this.queue.shift();
            this.displayNextFlashcard();
        })
    }

}