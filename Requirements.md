# Requirements

## Context
This will be a web application that I can use as a companion app to keep track of activities during a board game.  For now, it does not need to store persistant data.  The game is a tabletop miniatures game about renaissance nobility at a court ball; the main gameplay consists of nobles dancing and information warfare while trying to accomplish the scenario's objectives.  The graphic design of the app should reflect the theme, although it should be fairly minimalist overall.

## Technical Requirements
### Overview
    The app code should prioritize readability in the naming scheme, and concision and modularity in the code structure; it should avoid duplicate work wherever possible.  Error handling should be done gracefully but with minimal extra code introduced to account for it.
### Deployment
    The app will be deployed via a free online hosting provider, such as firebase or gitlab pages.
### Data
    Although future database integration may be pursued, for now, all game data should be stored in a separate folder of json documents, organized by type (e.g. a file for characters, a file for scenarios, a file for events, a file for standard actions, etc.)

## Business Requirements
The app should have several features.  Players should be able to toggle between reference mode and play mode.
### Reference Mode:
In reference mode, information on the scenarios and characters is fully and freely accessible, like a wiki.
### Play Mode:
1) Scenario Selection
    When opening the app, the player should be prompted to select a scenario from a list.  Scenarios should be displayed on cards that provide the name, flavor text, and objectives of the scenario.  It should have a link to the reference mode with the full scenario information.
2) Character Selection
    Next, the player should be prompted to select 2 characters from a list, separated by faction.  Characters should be displayed on a card that shows their stats and abilities.
3) Gameplay tracking
    Finally, after selecting characters, the app should enter gameplay mode.  Here, the app will do the following:
    Allow the player to keep track of the current round number
    Track the **Initiative** of all nobles in the game, within the round
    Allow the the player to keep track of their **Victory Points**, as determined by the scenario
    Provide a button to generate a random event based on a table when the round increments
    Provide a place to keep track of the two team stats, **Draw Size** and **Hand Size**, which can go up and down during the game in response to player actions.
    Players should be able to see details on the scenario and characters they selected by opening a card with more information.
    Players should also be able to open a card with information on the actions they can take (both the default actions, and any actions specific to characters via special abilities -- noted as such, if so)

## Game Information

### Characters
    Characters have a name, art, and short flavor text.
    Characters have the following two stats: Grace, Charm
    Characters also have 1 or 2 abilities, each with a name and text.

### Scenarios
    Scenarios have the following information:
    0) Name and Flavor Text: narrative explanation of the scenario
    1) Primary objective: a description of the main way to accrue victory points
    2) Secondary objectives: descriptions of the secondary way to accure victory points
    3) Scenario Special Rules: Any special rules affecting the scenario, including rules for what NPC's are present and how they behave.  This section may also include details on random events or dance patterns that are unique to the scenario.
    4) End conditions: when the game finishes; certain number of rounds, points, sudden stop, etc.