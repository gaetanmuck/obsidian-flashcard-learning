# Flashcard Learning

## Key features (TL;DR):

- Make multiple reviews in a single day
- A single review can last as long as needed
- Have descriptions for what is expected on a card
- See cards you know less and less often
- See cards you do not know each time
- Add new cards after each review
- Create card easily
- Create cards manually (for effectiveness)

## Detailed descriptions of features

### Reviews durations

#### Multiple reviews in a single day

A review is not managed by time, but rather by the advancement in a review: if a review is short, then another can be started right after.

#### Single review duration

On the contrary of the previous described feature, a review can also last forever, even if Obsidian is closed, on review load, the review restart where it was stopped.

### Expectation description

#### The problem

When learning things, one might need to have multiple information about something. 
For exemple, when learning country main cities, multiple information can be expected from the contry. One way of doing would be to create a flashcard for each information.
Just focus on 2 of them: the one from the country to its main city, and the one from the country to it's population size.
So when the flashcard is presented with the country name, what's expected is not clear: what is on the other side? Main city or population size?

#### Solution

In this plugin, there is the possibility to hint (actually, it is more like a description of what is expected) the answer.
So that when a flashcard is presented, the expectation is clear. And if the descriptions are correctly set, it works both ways!

### Learning

#### Best known, less shown

When a flashcard is correctly answered, it will be lesser presented. And the more correct answer in a row, the more the rarity of the presentation increases.
This is handled by the level of the card. 
Say a card of level 8 is presented and correctly answered (so level increases to 9), it means that this card will be presented again only in the 9th review after current one.

#### Reset on false

On the contrary, when a flashcard is wrongly answered, level will be reset to 0, and will be presented again in current review. And because at the end of the review the level will be 1 (because otherwise the review can not be finished), it will be presented again in next review.

### Card creation

#### Create cards with the helper

Flashcard can be created with the command `Create new Flashcard`.
This will show a modal where information can be set, and create the flashcard where the cursor was placed on command execution.
There is the possibility to help the creation of flashcards.
In your frontmatter YAML, properties can be set in order to prefill the modal. 
The properties are: `deck, side1, side1Desc, side2, side2Desc, level, nextReview`.
On creation, the plugin also check if the properties `flashcard: true` is also set. This tells the plugin that there is flashcard(s) in this file, and that it needs to be parsed. If it does not find it, it creates it.

#### Create cards manually

Once the syntax understood, flashcards can be created manually (or generating by a script for instance), and will be treated by the plugin according to provided information. In that scenario, the property `flashcard: true` has to be added also manually in the frontmatter YAML.

#### New cards

When learning a field, it might have some times when the speed of creating new cards is much higher than the speed of learning, and it can be discouraging to have hundreds of things to learn. Even this can become counter productive because these hundreds of new information are not presented with the spaced presentation they deserve. 
So to tackle this point, on creation, a card is set as "new", and will not be added to current review. 
But, at the end of each review, according to the plugin setting, a certain number of new cards will be added to next review (randomnly chosen across all news).
So that the review size is kept at a reasonnable size. 
When creating manually cards, do not forget to set level to -1 to enable this feature.

## Commands

The plugin provided two inputs:
    - One ribbon icon, to have sum up of what the plugin is aware of and to start (or resume) reviews
    - One command that can be execute in a file (advised on a new line!) to easily create a flashcard

## Home screen


See screen shots for more hints.

## Thanks

If you find value in this plugin and would like to show your support, you can [Buy Me A Coffee](https://www.buymeacoffee.com/gaetanmuck), it would be grateful.

