import { Modal, App, Setting, Notice } from 'obsidian'
import FlashcardLearningPlugin from 'src/main';
import { Flashcard } from 'src/model/flashcard';
import { ReviewModal } from './review';


export class HomeModal extends Modal {

	plugin: FlashcardLearningPlugin;

	flashcards: Array<Flashcard>;


	constructor(app: App, plugin: FlashcardLearningPlugin) {
		super(app);
		this.plugin = plugin;

		this.modalEl.addClasses(['w-80pct', 'max-w-500px'])
	}


	async onOpen() {

		// Title and container
		this.contentEl.createEl('h1', { text: "🃟 Flashcard Learning" });
		const container = this.contentEl.createDiv();
		container.addClasses(['col-start'])

		// Fetch all available flashcards on each 'load'
		await this.fetchFlashcards()


		// REVIEW

		// Container
		const review_container = container.createDiv()
		review_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])
		review_container.createEl('h5', { text: '🔀 Review' });

		// Settings container
		const settings_container = review_container.createDiv()
		settings_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])

		// All decks
		new Setting(settings_container)
			.setName(`Review (index: ${this.plugin.settings.reviewIndex})`)
			.addButton(button => button
				.setButtonText('Start')
				.onClick(() => {
					new ReviewModal(this.app, this.plugin, this.flashcards).open();
					this.close();
				})
			)


		// STATISTICS

		// Values
		const avgLevel = this.flashcards.reduce((acc, cur) => acc + cur.level, 0) / this.flashcards.length;
		const higherLevel = Math.max(...this.flashcards.map(fc => fc.level));
		const histogram = [];
		for (let i = 0; i <= higherLevel; i++) {
			const nb = this.flashcards.filter(fc => fc.level == i).length
			histogram.push({ count: nb, rate: Math.round((nb / this.flashcards.length) * 100) })
		}
		const newFlashcardsNb = this.flashcards.reduce((acc, cur) => cur.level == -1 ? acc + 1 : acc, 0)

		// Container
		const stats_container = container.createDiv()
		stats_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])
		stats_container.createEl('h5', { text: '📊 Statistics' });

		// Flashcard number
		const stats_newflashcardNumber = stats_container.createDiv();
		stats_newflashcardNumber.addClasses(['row-space-between', 'p-y-10px', 'p-x-30px']);
		stats_newflashcardNumber.createDiv({ text: 'New flashcard number:' })
		stats_newflashcardNumber.createDiv({ text: newFlashcardsNb + '' })

		// Flashcard number
		const stats_flashcardNumber = stats_container.createDiv();
		stats_flashcardNumber.addClasses(['row-space-between', 'p-y-10px', 'p-x-30px']);
		stats_flashcardNumber.createDiv({ text: 'Flashcard number:' })
		stats_flashcardNumber.createDiv({ text: this.flashcards.length + '' })

		// Average level
		const stats_avgLevel = stats_container.createDiv();
		stats_avgLevel.addClasses(['row-space-between', 'p-y-10px', 'p-x-30px']);
		stats_avgLevel.createDiv({ text: 'Average level:' })
		stats_avgLevel.createDiv({ text: (Math.round(avgLevel * 10) / 10) + '' })

		// Higher level
		const stats_higherLevel = stats_container.createDiv();
		stats_higherLevel.addClasses(['row-space-between', 'p-y-10px', 'p-x-30px']);
		stats_higherLevel.createDiv({ text: 'Higher level:' })
		stats_higherLevel.createDiv({ text: higherLevel + '' })

		// Histogram
		const stats_histogram = stats_container.createDiv();
		stats_histogram.addClasses(['col-start', 'p-x-30px'])
		for (let i = 0; i < histogram.length; i++) {
			const row = stats_histogram.createDiv();
			row.addClasses(['row-space-between', 'p-y-10px']);
			row.createDiv({ text: 'Cards at level ' + i })
			row.createDiv({ text: histogram[i].count + ' (' + histogram[i].rate + '%)' })
		}

	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}


	private async fetchFlashcards() {
		// Look for flashcards across the vault
		let malformedFound = false
		this.flashcards = [];
		await Promise.all(
			// Go through all the files
			this.app.vault.getMarkdownFiles()
				.filter(file => this.app.metadataCache.getFileCache(file)?.frontmatter?.flashcard)
				.map(async file => {
					let needToSave = false;

					// Get the lines (needed to remember which line a str is for replacement (malformed))
					const lines = (await this.app.vault.read(file)).split('\n')
					lines.forEach(async (line, i) => {

						// Is it a flashcard?
						if (Flashcard.isStrAFlashcard(line)) {

							// Parse flashcard
							const flashcard = Flashcard.fromString(file, i, line)

							// If parsing went well, adds it, otherwise, replace the string
							if (!flashcard.malformed) this.flashcards.push(flashcard)
							else {
								needToSave = true
								malformedFound = true
								lines[i] = flashcard.malformed
							}
						}
					})

					// Only write changed files (because a malformed flashcard was found)
					if (needToSave) this.plugin.app.vault.modify(file, lines.join('\n'))
				})
		)
		if (malformedFound) new Notice('Malformed Flashcard has been found, look for string "❌️" to find them.')
	}
}