import { Modal, App, Setting } from 'obsidian'
import FlashcardLearningPlugin from 'src/main';
import { Flashcard } from 'src/model/flashcard';
import { ReviewDeckModal } from './review-deck';


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
		this.contentEl.createEl('h1', { text: "📚 Flashcard Learning" });
		const container = this.contentEl.createDiv();
		container.addClasses(['col-start'])

		// Fetch all available flashcards on each 'load'
		await this.fetchFlashcards()

		// REVIEW

		// Container
		const review_container = container.createDiv()
		review_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])
		review_container.createEl('h5', { text: '📦 Review decks' });

		// Settings container
		const settings_container = review_container.createDiv()
		settings_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])

		// All decks
		new Setting(settings_container)
			.setName('Review all')
			.addButton(button => button
				.setButtonText('Start')
				.onClick(() => {
					this.close();
					new ReviewDeckModal(this.app, this.plugin, this.flashcards, 'all').open();
				})
			)

		// Each deck
		this.plugin.settings.decks.forEach(deck => {
			new Setting(settings_container)
				.setName(`Review ${deck.name}`)
				.setDesc(`Reviews done: ${deck.reviewIndex}`)
				.addButton(button => button
					.setButtonText('Start')
					.onClick(() => {
						this.close();
						new ReviewDeckModal(this.app, this.plugin, this.flashcards, deck.name).open();
					})
				)

		})


		// STATISTICS

		// Values
		const avgLevel = this.flashcards.reduce((acc, cur) => acc + cur.level, 0) / this.flashcards.length;
		const higherLevel = Math.max(...this.flashcards.map(fc => fc.level));
		const histogram = [];
		for(let i = 0; i <= higherLevel; i++) {
			const nb = this.flashcards.filter(fc => fc.level == i).length
			histogram.push({
				count: nb,
				rate: Math.round((nb / this.flashcards.length) * 100)
			})
		}

		// Container
		const stats_container = container.createDiv()
		stats_container.addClasses(['col-start', 'p-y-10px', 'p-x-30px'])
		stats_container.createEl('h5', { text: '📊 Statistics' });

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
		for(let i = 0; i < histogram.length; i++) {
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
		this.flashcards = [];
		await Promise.all(
			// Go through all the files
			this.app.vault.getMarkdownFiles().map(async file => {
				// And each lines
				const lines = (await this.app.vault.read(file)).split('\n');
				let change = false;
				lines.forEach(async (line, i) => {

					// If the line has the correct begining, it is flashcard
					if (line.startsWith('FLASHCARD')) {
						const result = Flashcard.fromString(file, i, this.plugin.settings.decks, line);

						// We only want the ones that are correct, and that have a deck
						if (!result.malformed && result.deck.name != 'No deck') this.flashcards.push(result);

						// If we find a malformed, the file is updated to let user know
						if(result.malformed) {
							lines[i] = result.toString();
							change = true;
						}
					}
				})
				
				// Only write changed files (because a malformed flashcard was found)
				if (change) this.plugin.app.vault.modify(file, lines.join('\n'))
			})
		)
	}
}