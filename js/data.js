import { state } from './state.js';

function fetchNoCache(url) {
  const separator = url.includes('?') ? '&' : '?';
  const cacheBustedUrl = `${url}${separator}t=${Date.now()}`;
  return fetch(cacheBustedUrl, { cache: 'no-store' });
}

// Load JSON game data and the markdown rules file into the shared state.
export async function loadData() {
  const jsonPaths = ['data/scenarios.json', 'data/characters.json', 'data/actions.json', 'data/events.json', 'data/abilities.json', 'data/tokens.json'];
  const jsonResponses = await Promise.all(jsonPaths.map(path => fetchNoCache(path).then(r => r.json())));
  state.data.scenarios = jsonResponses[0].scenarios || [];
  state.data.characters = jsonResponses[1].characters || [];
  state.data.actions = jsonResponses[2].actions || [];
  state.data.events = jsonResponses[3].events || [];
  state.data.abilities = jsonResponses[4].abilities || [];
  state.data.tokens = jsonResponses[5].tokens || [];

  const rulesText = await fetchNoCache('data/rules.md').then(r => r.text());
  state.data.rules = rulesText;
}

// Group objects by a shared key value for use in tabbed rendering.
export function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const group = item[key] || 'Unknown';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

// Select a random event from the loaded event list for gameplay flow.
export function generateRandomEvent() {
  if (!state.data.events.length) {
    state.latestEvent = null;
    return;
  }
  const index = Math.floor(Math.random() * state.data.events.length);
  state.latestEvent = state.data.events[index];
}
