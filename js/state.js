// Shared application state and DOM references.
export const state = {
  mode: 'play',
  data: {
    scenarios: [],
    characters: [],
    actions: [],
    events: [],
    abilities: [],
    rules: '',
  },
  selectedScenario: null,
  selectedCharacters: [],
  round: 1,
  victoryPoints: 0,
  drawSize: 5,
  handSize: 5,
  initiative: [],
  activeSubsection: 'scenario-selection',
  referenceFilter: 'all',
  initiativeEditMode: false,
  referenceTab: 'Scenarios',
  characterSelectionTab: null,
  referenceCharacterHouseTab: null,
  gameplayTab: 'Tracker',
  generateEventOnAdvance: true,
};

export const elements = {
  modeToggle: document.getElementById('modeToggle'),
  currentMode: document.getElementById('currentMode'),
  summaryText: document.getElementById('summaryText'),
  appContent: document.getElementById('appContent'),
};
