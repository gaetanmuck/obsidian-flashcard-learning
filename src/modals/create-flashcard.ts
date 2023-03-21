import { Modal, App, Setting } from 'obsidian'
import { Flashcard } from 'src/model/flashcard';
import { FlashcardLearningSettings } from 'src/model/settings';
import { Deck } from '../model/deck';


export class CreateFlashcardModal extends Modal {

	settings: FlashcardLearningSettings;
	lineNb: number;
	onSubmit: (fc1: Flashcard, fc2: Flashcard) => void
	
	// Modal fields
	deck: Deck;
	side1: string;
	side1Desc: string;
	side2: string;
	side2Desc: string;
	level: number;


	constructor(app: App, settings: FlashcardLearningSettings, lineNb: number, onSubmit: (fc1: Flashcard, fc2: Flashcard) => void) {
		super(app);
		this.settings = settings;
		this.onSubmit = onSubmit;

		this.deck = settings.decks[0] ?? 'No deck';
		this.level = settings.defaultLevel;
		this.lineNb = lineNb;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Create new Flashcard" });

		// Deck dropdown
		new Setting(contentEl)
			.setName("Deck")
			.addDropdown(dropdown => {
				this.settings.decks.forEach((deck, i) => dropdown.addOption(i + '', deck.name))
				dropdown.onChange(value => this.deck = this.settings.decks[parseInt(value)])
			})

		// Side 1 Description Text field
		new Setting(contentEl)
			.setName("Side 1 description")
			.addText(text => text.onChange(value => this.side1Desc = value.trim()))

		// Side 1 Text field
		new Setting(contentEl)
			.setName("Side 1")
			.addText(text => text.onChange(value => this.side1 = value.trim()))

		// Side 2 Description Text field
		new Setting(contentEl)
			.setName("Side 2 description")
			.addText(text => text.onChange(value => this.side2Desc = value.trim()))

		// Side 2 Text field
		new Setting(contentEl)
			.setName("Side 2")
			.addText(text => text.onChange(value => this.side2 = value.trim()))

		// Level, only update when it is a number
		new Setting(contentEl)
			.setName("Level")
			.addText(text => text
				.setValue(this.settings.defaultLevel + '')
				.onChange(value => this.level = Number(value) ?? this.settings.defaultLevel))

		// Submit button: send back 2 news Flashcard (side1/side2 AND side2/side1)
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText("Create")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(
						new Flashcard(this.deck, this.side1, this.side1Desc, this.side2, this.side2Desc, this.level),
						new Flashcard(this.deck, this.side2, this.side2Desc, this.side1, this.side1Desc, this.level),
					);
				}))
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}