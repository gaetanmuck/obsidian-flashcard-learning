import { App, Modal } from 'obsidian';


export class ConfirmModal extends Modal {


    onSubmit: (answer: boolean) => void;

    constructor(app: App, onSubmit: (answer: boolean) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h1", { text: "Are your sure?" });

        const row = contentEl.createDiv()
        row.addClasses(['row-space-between', 'p-30px']);

        // Cancel Button
        const cancelButton = row.createEl('button', { text: 'Cancel' });
        cancelButton.onClickEvent(() => {
            this.close();
            this.onSubmit(false);
        })

        // Confirm Button
        const confirmButton = row.createEl('button', { text: 'Confirm' });
        confirmButton.addClasses(['bg-red']);
        confirmButton.onClickEvent(() => {
            this.close();
            this.onSubmit(true);
        })
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}