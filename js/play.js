import { state, elements } from './state.js';
import { createCard, createButton, createText, createTabs, clearContent, createStatRow, createDetailsCard, updateStatus } from './dom.js';
import { groupBy, generateRandomEvent } from './data.js';
import { renderCharacterPopup, renderReferenceMode } from './reference.js';

// Render the selected play mode screen based on current state.
export function renderPlayMode() {
  clearContent();
  if (!state.selectedScenario) {
    renderScenarioSelection();
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
    return;
  }

  if (state.selectedCharacters.length < state.maxSelectedCharacters) {
    renderCharacterSelection();
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
    return;
  }

  state.generateEventOnAdvance = state.generateEvents;
  if (state.generateEvents) {
    generateRandomEvent();
  }
  renderGameplayScreen();
  updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
}

// Render the scenario selection screen with scenario cards.
function renderScenarioSelection() {
  const intro = createCard([
    createText('h2', 'Choose a Scenario'),
    createText('p', 'Select a scenario card to begin play. Each card includes the name, flavor text, and objective summary.'),
  ]);
  elements.appContent.appendChild(intro);

  const eventCheckboxLabel = document.createElement('label');
  eventCheckboxLabel.className = 'checkbox-label';
  const eventCheckbox = document.createElement('input');
  eventCheckbox.type = 'checkbox';
  eventCheckbox.checked = state.generateEvents;
  eventCheckbox.addEventListener('change', () => { state.generateEvents = eventCheckbox.checked; });
  eventCheckboxLabel.append(eventCheckbox, createText('span', 'Generate events during gameplay'));
  elements.appContent.appendChild(createCard([eventCheckboxLabel]));

  const scenarioGrid = document.createElement('div');
  scenarioGrid.className = 'card-list';
  state.data.scenarios.forEach(scenario => {
    const card = createCard([
      createText('h3', scenario.name),
      createText('p', scenario.flavorText),
      createText('p', `Primary objective: ${scenario.primaryObjective}`),
      createText('p', `Secondary objectives: ${scenario.secondaryObjectives}`),
      createButton('Select scenario', () => {
        state.selectedScenario = scenario;
        state.activeSubsection = 'character-selection';
        renderPlayMode();
        window.scrollTo(0, 0);
      }),
    ]);
    const refLink = createButton('View full reference', () => {
      state.mode = 'reference';
      renderReferenceMode();
      elements.modeToggle.textContent = 'Switch to Play';
    });
    card.appendChild(refLink);
    scenarioGrid.appendChild(card);
  });
  elements.appContent.appendChild(scenarioGrid);
}

// Render the character selection screen with faction tabs.
function renderCharacterSelection() {
  clearContent();
  const selectedFaction = state.selectedCharacters[0]?.faction || null;
  const intro = createCard([
    createText('h2', `Choose ${state.maxSelectedCharacters} Characters`),
    createText('p', `Select ${state.maxSelectedCharacters} nobles from one faction. Use the tabs to browse by house.`),
    selectedFaction ? createText('p', `Selected faction: ${selectedFaction}`) : createText('p', `Selected: ${state.selectedCharacters.length}/${state.maxSelectedCharacters}`),
  ]);
  elements.appContent.appendChild(intro);

  const charactersByFaction = groupBy(state.data.characters, 'faction');
  const factions = Object.keys(charactersByFaction);
  if (!state.characterSelectionTab || !factions.includes(state.characterSelectionTab)) {
    state.characterSelectionTab = factions[0] || null;
  }

  const tabs = createTabs(factions, state.characterSelectionTab, tabName => {
    state.characterSelectionTab = tabName;
    renderCharacterSelection();
  });
  elements.appContent.appendChild(tabs);

  const activeCharacters = charactersByFaction[state.characterSelectionTab] || [];
  const list = document.createElement('div');
  list.className = 'card-list';

  activeCharacters.forEach(character => {
    const selected = state.selectedCharacters.some(c => c.name === character.name);
    const differentFaction = selectedFaction && character.faction !== selectedFaction;
    const disabled = !selected && (state.selectedCharacters.length >= state.maxSelectedCharacters || differentFaction);
    const card = createCard([
      createText('h4', character.name),
      createText('p', character.flavorText),
      createText('p', `Grace: ${character.grace} • Charm: ${character.charm}`),
      createText('p', `Abilities:`),
      ...character.abilities.map(id => {
        const ability = state.data.abilities.find(a => a.id === id);
        return ability ? createText('p', `• ${ability.name}: ${ability.text}`) : createText('p', '• Unknown ability');
      })
    ]);
    if (disabled) {
      card.classList.add('disabled-card');
    }
    const button = createButton(selected ? 'Remove' : 'Select', () => {
      toggleCharacterSelection(character);
      renderCharacterSelection();
    });
    button.disabled = disabled;
    card.appendChild(button);
    list.appendChild(card);
  });

  elements.appContent.appendChild(list);

  if (state.selectedCharacters.length === state.maxSelectedCharacters) {
    elements.appContent.appendChild(createButton('Continue to gameplay', () => {
      state.selectedCharacters.forEach(character => {
        if (!state.initiative.some(entry => entry.name === character.name)) {
          state.initiative.push({ name: character.name, value: 0 });
        }
      });
      if (state.selectedScenario.npcs) {
        state.selectedScenario.npcs.forEach(npc => {
          if (!state.initiative.some(entry => entry.name === npc.name)) {
            state.initiative.push({ name: npc.name, value: 0 });
          }
        });
      }
      renderPlayMode();
      window.scrollTo(0, 0);
    }));
  }

  elements.appContent.appendChild(createButton('Back', () => {
    state.selectedScenario = null;
    state.selectedCharacters = [];
    state.characterSelectionTab = null;
    state.activeSubsection = 'scenario-selection';
    renderPlayMode();
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
  }));
}

// Add or remove characters from the selection list.
function toggleCharacterSelection(character) {
  const index = state.selectedCharacters.findIndex(c => c.name === character.name);
  if (index >= 0) {
    state.selectedCharacters.splice(index, 1);
    return;
  }
  if (state.selectedCharacters.length < state.maxSelectedCharacters) {
    state.selectedCharacters.push(character);
  }
}

// Render the gameplay screen with tracker and details sections.
function renderGameplayScreen() {
  clearContent();
  state.activeSubsection = 'gameplay';

  const header = createCard([
    createText('h2', 'Gameplay Tracking'),
    createText('p', state.selectedScenario.flavorText),
  ]);
  header.classList.add('gameplay-header');
  const roundBadge = createText('div', `Round ${state.round}`, 'round-pill');
  const scenarioLabel = createText('p', `Scenario: ${state.selectedScenario.name}`);
  header.appendChild(roundBadge);
  header.appendChild(scenarioLabel);
  elements.appContent.appendChild(header);

  const primaryPanel = createCard([
    createText('h3', 'Round and Score'),
    ...createStatRow('Victory Points', state.victoryPoints, value => { state.victoryPoints = value; renderGameplayScreen(); }),
    ...createStatRow('Draw Size', state.drawSize, value => { state.drawSize = value; renderGameplayScreen(); }, 9),
    ...createStatRow('Hand Size', state.handSize, value => { state.handSize = value; renderGameplayScreen(); }, 9),
    createText('p', 'Advance the round and optionally generate a new event.'),
  ]);

  const eventToggleLabel = document.createElement('label');
  eventToggleLabel.className = 'checkbox-label';
  const eventCheckbox = document.createElement('input');
  eventCheckbox.type = 'checkbox';
  eventCheckbox.checked = state.generateEventOnAdvance;
  eventCheckbox.addEventListener('change', () => { state.generateEventOnAdvance = eventCheckbox.checked; });
  eventToggleLabel.append(eventCheckbox, createText('span', 'Generate an event when advancing the round'));
  primaryPanel.appendChild(eventToggleLabel);

  primaryPanel.appendChild(createButton('Advance round', () => {
    if (state.generateEventOnAdvance) {
      generateRandomEvent();
    } else {
      state.latestEvent = null;
    }
    state.round += 1;
    renderGameplayScreen();
  }));
  primaryPanel.appendChild(createText('p', state.latestEvent ? `Event for this round: ${state.latestEvent.name} — ${state.latestEvent.result}` : 'No event generated yet.'));

  const gameTabs = createTabs(['Tracker', 'Details'], state.gameplayTab, tab => {
    state.gameplayTab = tab;
    renderGameplayScreen();
  });

  const trackerSection = document.createElement('div');
  trackerSection.className = 'gameplay-section';
  trackerSection.append(primaryPanel, createCard([createText('h3', 'Initiative Tracker'), ...renderInitiativeTable()]));

  const detailsSection = document.createElement('div');
  detailsSection.className = 'details-section';
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'card-list';
  detailsContainer.append(
    createDetailsCard('Selected characters', renderSelectedCharacters()),
    createDetailsCard('Available actions', renderAvailableActions()),
    createDetailsCard('Scenario details', renderScenarioDetails()),
  );
  detailsSection.append(detailsContainer);

  elements.appContent.append(header, gameTabs);
  if (state.gameplayTab === 'Tracker') {
    elements.appContent.append(trackerSection);
  } else {
    elements.appContent.append(detailsSection);
  }
}

// Render the scenario details panel for gameplay.
function renderScenarioDetails() {
  const box = document.createElement('div');
  box.append(
    createText('p', `Primary objective: ${state.selectedScenario.primaryObjective}`),
    createText('p', `Secondary objectives: ${state.selectedScenario.secondaryObjectives}`),
    createText('p', `Special rules: ${state.selectedScenario.specialRules}`),
    createText('p', `End conditions: ${state.selectedScenario.endConditions}`),
  );
  if (state.selectedScenario.npcs && state.selectedScenario.npcs.length > 0) {
    state.selectedScenario.npcs.forEach(npc => {
      const npcCard = createCard([
        createText('h4', npc.name),
        createText('p', npc.description),
      ]);
      box.appendChild(npcCard);
    });
  }
  return box;
}

// Render the selected characters panel.
function renderSelectedCharacters() {
  const box = document.createElement('div');
  box.className = 'card-list';
  state.selectedCharacters.forEach(character => {
    const card = createCard([
      createText('h4', `${character.name} — ${character.faction}`),
      createText('p', 'Tap to view details'),
    ]);
    card.classList.add('clickable-character-card');
    card.addEventListener('click', () => renderCharacterPopup(character.name));
    box.appendChild(card);
  });
  return box;
}

// Render the available actions panel during gameplay.
function renderAvailableActions() {
  const box = document.createElement('div');
  box.className = 'card-list';

  const genericActions = state.data.actions || [];
  const characterAbilities = state.selectedCharacters.flatMap(character =>
    character.abilities
      .map(id => ({ character, ability: state.data.abilities.find(a => a.id === id) }))
      .filter(item => item.ability && item.ability.isAction)
  );

  if (!genericActions.length && !characterAbilities.length) {
    box.appendChild(createCard([createText('p', 'No available actions or character abilities in the data file.')]));
    return box;
  }

  if (genericActions.length) {
    box.appendChild(createText('h3', 'Generic Actions'));
    genericActions.forEach(action => {
      const actionCard = createCard([
        createText('h4', action.name),
        createText('p', action.description),
        createText('p', `Source: ${action.source || 'Generic'}`),
      ]);
      box.appendChild(actionCard);
    });
  }

  if (characterAbilities.length) {
    box.appendChild(createText('h3', 'Character Specific Actions'));
    characterAbilities.forEach(({ character, ability }) => {
      const abilityCard = createCard([
        createText('h4', ability.name),
        createText('p', ability.text),
        createText('p', `Source: ${character.name}`),
      ]);
      box.appendChild(abilityCard);
    });
  }

  return box;
}

// Render the initiative tracker table with value controls.
function renderInitiativeTable() {
  const wrapper = document.createElement('div');
  wrapper.className = 'card-list';

  const headerRow = document.createElement('div');
  headerRow.className = 'initiative-header';

  const editToggle = createButton(state.initiativeEditMode ? 'Exit Edit Mode' : 'Edit Characters', () => {
    state.initiativeEditMode = !state.initiativeEditMode;
    renderGameplayScreen();
  });
  headerRow.appendChild(editToggle);

  const randomizeButton = createButton('Randomize', () => {
    const n = state.initiative.length;
    const values = Array.from({length: n}, (_, i) => i + 1);
    const shuffled = values.sort(() => Math.random() - 0.5);
    state.initiative.forEach((entry, index) => {
      entry.value = shuffled[index];
    });
    renderGameplayScreen();
  });
  headerRow.appendChild(randomizeButton);
  wrapper.appendChild(headerRow);

  if (!state.initiative.length) {
    wrapper.appendChild(createCard([createText('p', 'No initiative entries yet. Enter edit mode to add characters.')]));
    return [wrapper];
  }

  const sortedInitiative = [...state.initiative].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.name.localeCompare(b.name);
  });

  if (state.initiativeEditMode) {
    const availableCharacters = [
      ...state.data.characters.map(c => c.name),
      ...(state.selectedScenario?.npcs?.map(n => n.name) || [])
    ].filter(name => !state.initiative.some(entry => entry.name === name));

    if (availableCharacters.length > 0) {
      const select = document.createElement('select');
      select.className = 'custom-select';
      select.innerHTML = '<option value="">Select character to add...</option>' +
        availableCharacters.map(name => `<option value="${name}">${name}</option>`).join('');
      const addBtn = createButton('Add', () => {
        if (select.value) {
          state.initiative.push({ name: select.value, value: 0 });
          renderGameplayScreen();
        }
      });
      const addControls = document.createElement('div');
      addControls.className = 'action-row';
      addControls.append(select, addBtn);
      const editCard = createCard([createText('p', 'Add a character to initiative:'), addControls]);
      editCard.classList.add('initiative-edit-card');
      wrapper.appendChild(editCard);
    }
  }

  sortedInitiative.forEach(entry => {
    const row = createCard([
      createText('h4', entry.name),
      createText('p', `Initiative: ${entry.value}`),
    ]);
    row.classList.add('initiative-row');
    row.addEventListener('click', event => {
      if (event.target.closest('button') || event.target.tagName === 'SELECT' || event.target.tagName === 'INPUT') return;
      renderCharacterPopup(entry.name);
    });

    const valueControls = document.createElement('div');
    valueControls.className = 'stat-controls';
    const decBtn = createButton('-', () => {
      const index = state.initiative.findIndex(e => e.name === entry.name);
      state.initiative[index].value = Math.max(0, entry.value - 1);
      renderGameplayScreen();
    });
    const valueDisplay = createText('span', entry.value.toString());
    valueDisplay.className = 'stat-value';
    const incBtn = createButton('+', () => {
      const index = state.initiative.findIndex(e => e.name === entry.name);
      state.initiative[index].value += 1;
      renderGameplayScreen();
    });
    valueControls.append(decBtn, valueDisplay, incBtn);
    row.appendChild(valueControls);

    if (state.initiativeEditMode) {
      const removeButton = createButton('Remove', () => {
        const index = state.initiative.findIndex(e => e.name === entry.name);
        state.initiative.splice(index, 1);
        renderGameplayScreen();
      });
      row.appendChild(removeButton);
    }

    wrapper.appendChild(row);
  });

  return [wrapper];
}
