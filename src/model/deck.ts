export class Deck {

    name: string;
    reviewIndex: number;

    constructor(name: string, reviewIndex=0) {
        this.name = name
        this.reviewIndex = reviewIndex
    }
}