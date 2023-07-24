import { Modal, App, Setting, DropdownComponent, TFile } from 'obsidian'
import { Flashcard } from 'src/model/flashcard';


export class CreateFlashcardModal extends Modal {

	// Call back after modal is closed
	onSubmit: (fc1: Flashcard, fc2: Flashcard) => void

	// Modal fields
	deck: string;
	level: number;
	nextReview: number;
	side1: string;
	side1Desc: string;
	side2: string;
	side2Desc: string;


	constructor(app: App, frontmatter: any, lineNb: number, onSubmit: (fc1: Flashcard, fc2: Flashcard) => void) {
		super(app);
		this.onSubmit = onSubmit;

		// Handling defaults from md file
		this.deck = frontmatter?.deck ?? 'No deck'
		this.level = frontmatter?.level ?? -1
		this.nextReview = frontmatter?.nextReview ?? 0
		this.side1Desc = frontmatter?.side1Desc ?? ''
		this.side1 = frontmatter?.side1 ?? ''
		this.side2Desc = frontmatter?.side2Desc ?? ''
		this.side2 = frontmatter?.side2 ?? ''
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Create new Flashcard" });

		// Deck
		new Setting(contentEl)
			.setName("Deck")
			.addText(text => text.onChange(value => this.deck = value.trim()).setValue(this.deck))


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

		// Submit button: send back 2 news Flashcard (side1/side2 AND side2/side1)
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText("Create")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(
						new Flashcard(this.level, this.nextReview, this.deck, this.side1Desc, this.side1, this.side2Desc, this.side2),
						new Flashcard(this.level, this.nextReview, this.deck, this.side2Desc, this.side2, this.side1Desc, this.side1)
					);
				}))
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}