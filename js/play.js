import { state, elements } from './state.js';
import { createCard, createButton, createText, createTabs, clearContent, createStatRow, createDetailsCard, updateStatus } from './dom.js';
import { groupBy, generateRandomEvent } from './data.js';
import { renderCharacterPopup, renderReferenceMode } from './reference.js';

// Render the selected play mode screen based on current state.
export function renderPlayMode() {
  clearContent();
  if (!state.selectedScenario) {
    renderScenarioSelection();
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round);
    return;
  }

  if (state.selectedCharacters.length < 2) {
    renderCharacterSelection();
    updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round);
    return;
  }

  renderGameplayScreen();
  updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round);
}

// Render the scenario selection screen with scenario cards.
function renderScenarioSelection() {
  const intro = createCard([
    createText('h2', 'Choose a Scenario'),
    createText('p', 'Select a scenario card to begin play. Each card includes the name, flavor text, and objective summary.'),
  ]);
  elements.appContent.appendChild(intro);

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
  const intro = createCard([
    createText('h2', 'Choose Two Characters'),
    createText('p', 'Select two nobles from the available factions. Use the tabs to browse by house.'),
    createText('p', `Selected: ${state.selectedCharacters.length}/2`),
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
    const disabled = !selected && state.selectedCharacters.length >= 2;
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

  if (state.selectedCharacters.length === 2) {
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
      renderGameplayScreen();
      window.scrollTo(0, 0);
    }));
  }
}

// Add or remove characters from the selection list.
function toggleCharacterSelection(character) {
  const index = state.selectedCharacters.findIndex(c => c.name === character.name);
  if (index >= 0) {
    state.selectedCharacters.splice(index, 1);
    return;
  }
  if (state.selectedCharacters.length < 2) {
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
    state.round += 1;
    if (state.generateEventOnAdvance) {
      generateRandomEvent();
    }
    renderGameplayScreen();
  }));
  primaryPanel.appendChild(createText('p', state.latestEvent ? `Last event: ${state.latestEvent.name} — ${state.latestEvent.result}` : 'No event generated yet.'));

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
    createDetailsCard('Scenario details', renderScenarioDetails()),
    createDetailsCard('Selected characters', renderSelectedCharacters()),
    createDetailsCard('Available actions', renderAvailableActions()),
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
    box.append(createText('h4', 'NPCs in this scenario:'));
    state.selectedScenario.npcs.forEach(npc => {
      box.append(createText('p', `${npc.name}: ${npc.description}`));
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
  state.data.actions.forEach(action => {
    box.append(
      createText('h4', action.name),
      createText('p', action.description),
      createText('p', `Source: ${action.source}`),
    );
  });
  state.selectedCharacters.forEach(character => {
    const actionAbilities = character.abilities
      .map(id => state.data.abilities.find(a => a.id === id))
      .filter(ability => ability && ability.isAction);
    if (actionAbilities.length > 0) {
      box.append(createText('h4', `${character.name} Special Actions:`));
      actionAbilities.forEach(ability => {
        box.append(createText('p', `${ability.name}: ${ability.text}`));
      });
    }
  });
  return box;
}

// Render the initiative tracker table with value controls.
function renderInitiativeTable() {
  const wrapper = document.createElement('div');
  wrapper.className = 'card-list';

  const editToggle = createButton(state.initiativeEditMode ? 'Exit Edit Mode' : 'Edit Initiative', () => {
    state.initiativeEditMode = !state.initiativeEditMode;
    renderGameplayScreen();
  });
  wrapper.appendChild(createCard([createText('p', 'Toggle edit mode to add or remove entries.'), editToggle]));

  if (!state.initiative.length) {
    wrapper.appendChild(createCard([createText('p', 'No initiative entries yet. Enter edit mode to add characters.')]));
    return [wrapper];
  }

  const sortedInitiative = [...state.initiative].sort((a, b) => b.value - a.value);

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
