import { state, elements } from './state.js';
import { createCard, createText, createTabs, showPopup, renderMarkdown, clearContent, updateStatus } from './dom.js';
import { groupBy } from './data.js';

// Show the details popup for a named character or NPC.
export function renderCharacterPopup(name) {
  console.log(name);
  console.log(name === "Friendly Agents");
  if(name === "Friendly Agents") {
    const content = [];
    state.selectedCharacters.forEach(character => {
      content.push(createCard([
        createText('h4', character.name),
        createText('p', character.type, 'flavor-text'),
        createText('p', `Grace: ${character.grace} • Charm: ${character.charm}`),
        createText('p', `Abilities: ${character.abilities.map(ability => state.data.abilities.find(a => a.id === ability)?.name || ability).join(', ')}`),
      ]));
    });
    showPopup(name, content, true);
    return;
  }

  const character = state.data.characters.find(c => c.name === name);
  const npc = state.selectedScenario?.npcs?.find(n => n.name === name);
  const content = [];
  if (character) {
    content.push(createText('p', character.type, 'flavor-text'));
    content.push(createText('p', character.flavorText, 'flavor-text'));
    content.push(createText('p', `Faction: ${character.faction}`));
    content.push(createText('p', `Grace: ${character.grace} • Charm: ${character.charm}`));
    if (character.abilities.length) {
      content.push(createText('p', 'Abilities:'));
      character.abilities.forEach(id => {
        const ability = state.data.abilities.find(a => a.id === id);
        if (ability) {
          content.push(createText('p', `• ${ability.name}: ${ability.text}`));
        }
      });
    }
  } else if (npc) {
    content.push(createText('p', npc.type, 'flavor-text'));
    content.push(createText('p', npc.description));
    content.push(createText('p', 'NPC details are read-only and appear in initiative order automatically.', 'flavor-text'));
  } else {
    content.push(createText('p', 'Details not available.'));
  }
  showPopup(name, content);
}

// Render the reference tab experience with tabs for scenarios, characters, actions, events, and rules.
export function renderReferenceMode() {
  clearContent();
  state.activeSubsection = 'reference';
  if (!state.referenceTab) {
    state.referenceTab = 'Scenarios';
  }

  const intro = createCard([
    createText('h2', 'Reference Mode'),
    createText('p', 'Use the tabs to navigate scenarios, characters, actions, and events.'),
  ]);
  elements.appContent.appendChild(intro);

  const tabs = createTabs(['Scenarios', 'Characters', 'Actions', 'Events', 'Tokens', 'Rules'], state.referenceTab, tab => {
    state.referenceTab = tab;
    renderReferenceMode();
  });
  tabs.classList.add('sticky-tabs');

  if (state.referenceTab === 'Rules') {
    const rulesCard = createCard([
      createText('h2', 'Rules'),
      renderMarkdown(state.data.rules || 'No rules have been loaded yet.'),
    ]);
    elements.appContent.append(tabs, rulesCard);
    return;
  }

  const contentCard = createCard([createText('div', '')]);
  contentCard.classList.add('reference-content-card');

  const content = document.createElement('div');
  content.className = 'reference-tab-content';
  if (state.referenceTab === 'Scenarios') {
    content.append(...state.data.scenarios.map(renderScenarioReference));
  } else if (state.referenceTab === 'Characters') {
    const charactersByFaction = groupBy(state.data.characters, 'faction');
    const factions = Object.keys(charactersByFaction);
    if (!state.referenceCharacterHouseTab || !factions.includes(state.referenceCharacterHouseTab)) {
      state.referenceCharacterHouseTab = factions[0] || null;
    }
    const houseTabs = createTabs(factions, state.referenceCharacterHouseTab, tab => {
      state.referenceCharacterHouseTab = tab;
      renderReferenceMode();
    });
    const charactersSection = document.createElement('div');
    charactersSection.className = 'reference-characters-section';
    charactersSection.appendChild(houseTabs);
    const houseFlavorText = state.data.factions.find(f => f.name === state.referenceCharacterHouseTab)?.flavorText;
    if (houseFlavorText) {
      const flavorText = createText('p', houseFlavorText, 'flavor-text');
      charactersSection.appendChild(flavorText);
    }
    const characterList = document.createElement('div');
    characterList.className = 'card-list';
    const activeCharacters = charactersByFaction[state.referenceCharacterHouseTab] || [];
    activeCharacters.forEach(character => characterList.appendChild(renderCharacterReference(character)));
    charactersSection.appendChild(characterList);
    content.appendChild(charactersSection);
  } else if (state.referenceTab === 'Actions') {
    content.append(...state.data.actions.map(renderActionReference));
  } else if (state.referenceTab === 'Events') {
    content.append(...state.data.events.map(renderEventReference));
  } else if (state.referenceTab === 'Tokens') {
    content.append(...state.data.tokens.map(renderTokenReference));
  }
  contentCard.appendChild(content);

  elements.appContent.append(tabs, contentCard);
  updateStatus(state.mode, state.selectedScenario, state.activeSubsection, state.round, state.maxSelectedCharacters);
}

// Render a single scenario card inside the reference view.
function renderScenarioReference(scenario) {
  const node = document.createElement('div');
  node.className = 'card';
  node.append(
    createText('h4', scenario.name),
    createText('p', scenario.flavorText, 'flavor-text'),
    createText('p', `Primary objective: ${scenario.primaryObjective}`),
    createText('p', `Secondary objectives: ${scenario.secondaryObjectives}`),
    createText('p', `Special rules: ${scenario.specialRules}`),
    createText('p', `Scenario event: ${scenario.scenarioEvent}`),
    createText('p', `End conditions: ${scenario.endConditions}`),
  );
  if (scenario.npcs && scenario.npcs.length > 0) {
    node.append(createText('h5', 'NPCs:'));
    scenario.npcs.forEach(npc => {
      node.append(createText('p', `${npc.name}. ${npc.type}. ${npc.description}`));
    });
  }
  return node;
}

// Render a single character card inside the reference view.
function renderCharacterReference(character) {
  const node = document.createElement('div');
  node.className = 'card';
  const abilities = character.abilities.map(id => state.data.abilities.find(a => a.id === id)).filter(Boolean);
  node.append(
    createText('h4', `${character.name} — ${character.faction}`),
    createText('p', character.type, 'flavor-text'),
    createText('p', character.flavorText, 'flavor-text'),
    createText('p', `Grace: ${character.grace} • Charm: ${character.charm}`),
    createText('p', `Abilities:`),
    ...abilities.map(ability => createText('p', `• ${ability.name}: ${ability.text}`))
  );
  return node;
}

// Render a single action card inside the reference view.
function renderActionReference(action) {
  const node = document.createElement('div');
  node.className = 'card';
  node.append(
    createText('h4', action.name),
    createText('p', action.description),
    createText('p', `Source: ${action.source}`),
  );
  return node;
}

// Render a single token card inside the reference view.
function renderTokenReference(token) {
  const node = document.createElement('div');
  node.className = 'card';
  node.append(
    createText('h4', token.name),
    createText('p', token.text),
    createText('p', `Type: ${token.type}`, 'flavor-text'),
  );
  return node;
}

// Render a single event card inside the reference view.
function renderEventReference(event) {
  const node = document.createElement('div');
  node.className = 'card';
  node.append(
    createText('h4', event.name),
    createText('p', event.description, 'flavor-text'),
    createText('p', `Result: ${event.result}${event.id==="scenario-event" && !state.selectedScenario ? ' Select a scenario to see the event details.' : " See below:"}`),
  );
  state.selectedScenario && event.id==="scenario-event" ? node.append(createText('p', `${state.selectedScenario.name} Event Details: ${state.selectedScenario.scenarioEvent}`)) : null;
  return node;
}

// Render NPC details when referenced from a scenario.
function renderNpcReference(npc, scenarioName) {
  const node = document.createElement('div');
  node.className = 'card';
  node.append(
    createText('h4', `${npc.name} (${scenarioName})`),
    createText('p', npc.type, 'flavor-text'),
    createText('p', npc.description),
  );
  return node;
}

// Render the rules section as a single top-level card.
function renderRulesReference() {
  return createCard([
    createText('h4', 'Rules'),
    renderMarkdown(state.data.rules || 'No rules have been loaded yet.'),
  ]);
}
