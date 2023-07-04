import { Modal, App, Setting, DropdownComponent } from 'obsidian'
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


	constructor(app: App, settings: FlashcardLearningSettings, lineNb: number, defaults: {deck:string, side1_desc:string, side1:string, side2_desc:string, side2:string, level:string}, onSubmit: (fc1: Flashcard, fc2: Flashcard) => void) {
		super(app);
		this.settings = settings;
		this.onSubmit = onSubmit;
		
		// Handling defaults from md file
		this.deck = settings.decks.find(d => d.name == defaults.deck) ?? settings.decks[0] ?? 'No deck'
		this.side1Desc = defaults.side1_desc
		this.side1 = defaults.side1
		this.side2Desc = defaults.side2_desc
		this.side2 = defaults.side2
		this.level = parseInt(defaults.level) ?? settings.defaultLevel;
		this.lineNb = lineNb;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Create new Flashcard" });

		// Deck dropdown
		new Setting(contentEl)
			.setName("Deck")
			.addDropdown(dropdown => {
				this.settings.decks.forEach((deck, i) => dropdown.addOption(deck.name, deck.name))
				dropdown.onChange(value => this.deck = this.settings.decks[parseInt(value)])
				dropdown.setValue(this.deck.name)
		})

		// Side 1 Description Text field
		new Setting(contentEl)
			.setName("Side 1 description")
			.addText(text => text.onChange(value => this.side1Desc = value.trim()).setValue(this.side1Desc))

		// Side 1 Text field
		new Setting(contentEl)
			.setName("Side 1")
			.addText(text => text.onChange(value => this.side1 = value.trim())
			.setValue(this.side1))

		// Side 2 Description Text field
		new Setting(contentEl)
			.setName("Side 2 description")
			.addText(text => text.onChange(value => this.side2Desc = value.trim())
			.setValue(this.side2Desc))

		// Side 2 Text field
		new Setting(contentEl)
			.setName("Side 2")
			.addText(text => text.onChange(value => this.side2 = value.trim())
			.setValue(this.side2))

		// Level, only update when it is a number
		new Setting(contentEl)
			.setName("Level")
			.addText(text => text
				.setValue(this.level + '')
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