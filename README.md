# Flashcard learning

Flashcard-Learning is an Obsidian plugin made to learn things and remember them. 
Put your flashcards where you notes lie thanks to Obsidian, and create card out of your note to remember their substance, key concepts, or just knowledge like countries main cities.

## Main concepts

### Flashcard

A Flashcard is made of: 
- A Deck, 
- A first side with its description
- A second side with its description
- A level

### Review

We call a review, a learning session in which you review a selection of flashcards due for this review. The review will not be finished until all cards are out of the queue (e.g. you answered « Correct » to all flashcards; otherwise the card stays in the queue), even if you take multiple days to go through. This being said, you also can have multiple reviews in a single days. Actually, this plugin does not look at dates and time, but only on review indexes. That is why when you answer « Correct » you will not see the card again in x days, but rather in x reviews.

### Deck

Deck is parent of Flashcard. Each Flashcard should belong to one Deck. 

This is why, by default, all Flashcards belonging to the Deck « No Deck » will not be treated. If you have such cards in your vault, you should search with Obsidian the string « No deck » and replace them with the Deck you want to attribute them.

How are those « No deck » card existing? If you delete a Deck via the plugin settings, and you still have card in that deck, rather to also delete the card with it, they will be changed to « No deck ». That is so to avoid to delete information to fast. Another possibility of having no deck is if you create card manually: it is possible to directly in your Obsidian notes to create Flashcard with the right syntax. Then, when the home modal will load (by pressing the book icon on the ribbon) it will parse all Flashcards and attribute « No deck » to all Flashcard with an non existing deck. 

Each Deck has a review index that will be incremented each time you review it.

In this plugin, you also have the possibility to review all deck at once. It has then the consequence to increment indexes of all decks at once.

### Description

Each side of each Flashcard has a description field. This field helps the learner to know what he is asked for. For instance, if you would only have a Flashcard content with a « 1 » in it, what is expected to guess? But the description tells you « Atom: » so that you understand what you need to find, and can easily answer « Hydrogen ».

#### Level

All Flashcard has a level attributed. By default, on creation it has level 0. This tells how well you know a Flashcard. The more correct answer you give in a row, the higher the level will be. The level number also corresponds to the time you will have to wait before seeing this card again (if you answer correctly), or will drop to 0 (if you are wrong), and you will see this card again on next review.


## Get started

If you want to use this plugin, simply install and enable it through the community plugin store inside Obsidian. 
Once you have installed it, your Obsidian vault has two new features: the first one is accessible via a command « Create Flashcard », and the other is the book icon in the main ribbon.

### « Create Flashcard » command

This command is available when you are editing a note in your Obsidian vault. It allows you to create a Flashcard without mistake. 

On activation this command will open a modal containing a form with all the information needed to create a Flashcard. Once you have filled everything and validate the form, the plugin will add two new lines where your cursor was to create two Flashcards out of the information you provided. One good solution could be to have a Flashcard section in your notes to put all Flashcards there, but that is just an idea, you manage your notes as you wish.

If you understand what this commands produce, you could also create Flashcards manually with your keyboard, or other techniques you know about (copy/paste, code, ...). Maybe it is more suitable for you when you would create a bunch of Flashcards in one time. You could also put all Flashcards of a Deck in a dedicated file, that is up to you.

One counter part of creating a lot Flashcard in one time could be to have a lot of new information in the next review, and that is maybe not optimal to learn correclty. 
To take this problem away you could create only a certain number of new Flashcard a day, or « deactivate » some of them by changing the string (like writing `-FLASHCARD...` instead of `FLASHCARD...`), but again, this is up to you.

### Book button in the ribbon

This button is the place to start reviews. When clicking on it, you will be informed of general statistics about all your Flashcards, and have the possibility to start a review, either on a particular Deck, or on all of them. No rocket science there, just the GUI of the plugin.


## Other existing solutions

There is other existing solutions across the web to handle Flashcard learning with the more popular of them [Anki](https://apps.ankiweb.net/). This plugin does not have the pretention of being better than these other solutions. I (the developer of this plugin) was just not 100% satisfied with what he used and tried accross the years. And it came a time where I discovered that developping an Obsidian plugin is not so hard, so I decided to invest the time to make a Flashcard app that answers my need and that would be in the same application my Second Brain is! I also decided to share it with everyone, in case it also correspond to the need of others, so if you read until here, I consider it already worth the investment.

In case you would give my investment event more worth, here is a link to do it:

<a href="https://www.buymeacoffee.com/gaetanmuck" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>


Cheers!