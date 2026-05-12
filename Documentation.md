# Danse Macabre Companion App

## Overview
This workspace now contains a static web application intended as a companion tracker for the Danse Macabre board game. The app is designed to be deployed on a free static host such as Firebase Hosting, GitLab Pages, or GitHub Pages.

## Files created
- `index.html`: main static web page for the app.
- `styles.css`: theme and layout styling.
- `package.json`: enables ES module loading for the new JS module structure.
- `js/state.js`: shared application state and DOM references.
- `js/data.js`: data loading and helper utilities.
- `js/dom.js`: DOM creation helpers, markdown rendering, and status updates.
- `js/reference.js`: reference mode rendering and popups.
- `js/play.js`: play mode rendering, scenario/character selection, gameplay tracking, and initiative management.
- `js/main.js`: app bootstrap and global event wiring.
- `data/scenarios.json`: scenario data store.
- `data/characters.json`: character data store.
- `data/actions.json`: action definitions store.
- `data/events.json`: random event table store.
- `data/rules.md`: rules reference content.

## App behavior
- `Play Mode` guides the user through:
  1. Scenario selection
  2. Character selection from a single faction
  3. Gameplay tracking with round number, victory points, draw size, hand size, event generation, and initiative tracking
- `Reference Mode` displays the current scenario, character, action, and event data in a free-browsing wiki-style layout.
- The app loads JSON from the `data/` folder and does not store any persistent data.
- The app forces a fresh data fetch on startup to avoid stale browser cache issues.

## Data notes
Each data file includes example records so you can add the actual game data yourself.

`characters.json` references abilities by ID (e.g., "abilities": ["ribbon-of-influence"]).
`abilities.json` contains the full ability definitions.
`scenarios.json` includes an "npcs" array for scenario-specific NPCs that auto-populate initiative.

## Assumptions
- `characters.json` includes character `faction` values to group selections.
- `actions.json` includes standard generic actions, while character-specific abilities are rendered separately for selected characters.
- `events.json` is used for random event generation when advancing a round.
- Initiative tracking is manual: users may add entries and adjust values during play.

## Questions
1. Should character selection enforce one character from each faction, or may both selected characters be from the same faction?
2. Should the app include a dedicated NPC list or encounter tracker for scenario-specific NPCs, or is that handled by scenario special rules only?
3. Do you want the random event generator to automatically apply effects to scores/stats, or only display a result for the players to resolve manually?
4. How many default actions should be exposed, and should action cards distinguish between generic actions and character-specific abilities more clearly?
5. Should the app include any additional play-level controls, such as quick reset, undo last round, or scenario-specific end-condition logic?

## Recent Updates
- Fixed bug where selecting nobles added duplicate cards instead of updating existing ones.
- Added automatic scrolling to top when transitioning between setup steps.
- Updated status bar to show current round and scenario during gameplay.
- Replaced text inputs for victory points, draw size, and hand size with increment/decrement buttons (draw/hand capped at 9).
- Selected characters are now automatically added to the initiative tracker when starting gameplay.
- Initiative values now use +/- buttons instead of text fields.
- Initiative management now uses an "edit mode" with a dropdown to select from available characters/NPCs.
- The initiative tracker header now appears as part of the main tracker card instead of as its own separate card.
- Available actions now render as individual cards inside the Available Actions details panel.
- Added example NPC to "Masquerade Mystery" scenario, which auto-populates initiative.
- Scenarios now include an "npcs" array for scenario-specific NPCs.

## Running locally
Open `index.html` in a browser from a local server. If you need a simple static server, use a small hosting tool such as `python -m http.server` in the `App` folder.
