# Danse Macabre Companion App

A static web application designed as a companion tracker for the Danse Macabre tabletop miniatures game. Track scenarios, characters, gameplay rounds, victory points, initiative, and random events in a minimalist, theme-appropriate interface.

## Features

- **Reference Mode**: Browse all game data (scenarios, characters, actions, abilities, events) in a wiki-style layout.
- **Play Mode**: Guided flow for selecting scenarios and characters, then tracking gameplay elements like rounds, scores, initiative, and random events.
- **Data-Driven**: All game content stored in separate JSON files for easy customization.
- **Static Hosting Ready**: No server-side components; deployable to Firebase, GitLab Pages, GitHub Pages, etc.

## Project Structure

```
App/
├── index.html          # Main HTML page
├── styles.css          # Styling and theme
├── app.js              # Application logic and UI
├── Documentation.md    # Implementation notes and questions
├── README.md           # This file
└── data/
    ├── scenarios.json  # Scenario definitions
    ├── characters.json # Character data (references abilities)
    ├── actions.json    # Action definitions
    ├── abilities.json  # Ability definitions
    └── events.json     # Random event table
```

## Data Structure

All game data is stored in JSON files under the `data/` folder. Each file contains an array of objects.

### scenarios.json
```json
{
  "scenarios": [
    {
      "id": "scenario-id",
      "name": "Scenario Name",
      "flavorText": "Narrative description",
      "primaryObjective": "Main win condition",
      "secondaryObjectives": "Additional objectives",
      "specialRules": "Special mechanics",
      "endConditions": "When the game ends",
      "npcs": [
        {
          "name": "NPC Name",
          "description": "NPC behavior and role"
        }
      ]
    }
  ]
}
```

### characters.json
```json
{
  "characters": [
    {
      "id": "character-id",
      "name": "Character Name",
      "faction": "Faction Name",
      "flavorText": "Character description",
      "grace": 7,
      "charm": 6,
      "abilities": ["ability-id-1", "ability-id-2"]
    }
  ]
}
```

### abilities.json
```json
{
  "abilities": [
    {
      "id": "ability-id",
      "name": "Ability Name",
      "text": "Ability description and mechanics"
    }
  ]
}
```

### actions.json
```json
{
  "actions": [
    {
      "id": "action-id",
      "name": "Action Name",
      "description": "What the action does",
      "source": "Default action" // or "Character ability"
    }
  ]
}
```

### events.json
```json
{
  "events": [
    {
      "id": "event-id",
      "name": "Event Name",
      "description": "Event trigger or context",
      "result": "What happens when the event occurs"
    }
  ]
}
```

## Running Locally

### Prerequisites
- A web browser (Chrome, Firefox, Safari, etc.)
- A local HTTP server (to serve files properly for JSON loading)

### Option 1: Python (Recommended)
If you have Python installed:
```bash
cd path/to/App
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Node.js
Install `http-server` globally:
```bash
npm install -g http-server
```
Then:
```bash
cd path/to/App
http-server
```
Open the provided URL in your browser.

### Option 3: VS Code Extension
Use the "Live Server" extension in VS Code to serve the folder.

### Why a Server?
The app uses `fetch()` to load JSON files. Browsers block `fetch()` requests to local files (file:// protocol) for security reasons. A local server serves files over HTTP, allowing the app to load data properly.

## Development

### Checking JavaScript Syntax
Use Node.js to check for syntax errors without running the code:
```bash
node --check app.js
```
This parses the file and reports any syntax issues. Useful for quick validation during development.

### Adding Game Data
1. Edit the JSON files in the `data/` folder.
2. Add new scenarios, characters, abilities, etc. following the structure above.
3. Ensure IDs are unique and referenced correctly (e.g., character abilities reference ability IDs).
4. Reload the app in your browser to see changes.

### Customization
- **Styling**: Modify `styles.css` for theme changes.
- **Logic**: Update `app.js` for new features or UI changes.
- **Data**: Add more content to JSON files as needed.

## Deployment

### Static Hosting Options
- **Firebase Hosting**: `firebase deploy`
- **GitLab Pages**: Push to a GitLab repository with Pages enabled
- **GitHub Pages**: Use GitHub Actions or manual upload
- **Netlify**: Connect repository for automatic deployment
- **Vercel**: Import project for hosting

### Deployment Steps
1. Ensure all files are in the `App/` folder.
2. Upload/push to your hosting provider.
3. The app will load from the root path (e.g., `https://yourdomain.com/`).

## Browser Support
- Modern browsers with ES6+ support
- Tested on Chrome, Firefox, Safari, Edge

## Contributing
This is a static app with no build process. Make changes to HTML, CSS, JS, or JSON files directly.

## License
No license specified - use as needed for your Danse Macabre games.