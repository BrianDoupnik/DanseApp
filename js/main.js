import { state, elements } from './state.js';
import { loadData } from './data.js';
import { renderPlayMode } from './play.js';
import { renderReferenceMode } from './reference.js';
import { updateStatus, clearContent, createCard, createText } from './dom.js';

// Wire the global mode toggle button to swap between play and reference mode.
function resetGame() {
  state.mode = 'play';
  state.selectedScenario = null;
  state.selectedCharacters = [];
  state.round = 1;
  state.victoryPoints = 0;
  state.drawSize = 1;
  state.handSize = 1;
  state.initiative = [];
  state.activeSubsection = 'scenario-selection';
  state.initiativeEditMode = false;
  state.characterSelectionTab = null;
  state.gameplayTab = 'Tracker';
  state.generateEventOnAdvance = false;
  state.generateEvents = false;
  state.latestEvent = null;
  renderPlayMode();
  updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
}

function wireEvents() {
  elements.modeToggle.addEventListener('click', () => {
    elements.modeToggle.disabled = true;
    if (state.mode === 'reference') {
      state.mode = 'play';
      renderPlayMode();
    } else {
      state.mode = 'reference';
      renderReferenceMode();
    }
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
    elements.modeToggle.disabled = false;
  });

  elements.resetButton.addEventListener('click', () => {
    resetGame();
  });
}

// Initialize the application by loading data, wiring events, and rendering the first screen.
async function init() {
  await loadData();
  wireEvents();
  updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
  renderPlayMode();
}

init().catch(error => {
  clearContent();
  const message = createCard([
    createText('h2', 'Unable to load game data'),
    createText('p', 'Check that the JSON files exist in the data folder and that the site is hosted from a web server.'),
    createText('p', error.message),
  ]);
  elements.appContent.appendChild(message);
});
