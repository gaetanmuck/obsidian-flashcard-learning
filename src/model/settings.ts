import { Deck } from './deck';

export interface FlashcardLearningSettings {
    defaultLevel: number;
    decks: Array<Deck>;
    wrongStepBack: number;
}
