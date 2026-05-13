import { elements } from './state.js';

// Remove any existing rendered content from the main app container.
export function clearContent() {
  elements.appContent.innerHTML = '';
}

// Update the status bar text based on the current state.
export function updateStatus(mode, selectedScenario, activeSubsection, round, maxSelectedCharacters) {
  const modeLabel = mode === 'reference' ? 'Reference Mode' : 'Play Mode';
  elements.currentMode.textContent = modeLabel;
  
  // TODO: Refactor this to use the elements from the state instead of getting it here
  // for some reason using elements.progressBar from the state.js file is null here, so I am getting it here.
  const progressBar = document.getElementById("progressBar");
  elements.progressBar = progressBar;

  if (mode === 'play') {
    elements.progressBar.style.opacity = 1;
    if (activeSubsection === 'gameplay') {
      elements.summaryText.textContent = `Scenario: ${selectedScenario.name} • Round: ${round}`;
      elements.progressBar.style.width = "100%";
    } else if (selectedScenario) {
      elements.summaryText.textContent = `Scenario: ${selectedScenario.name} • Select ${maxSelectedCharacters} characters to begin.`;
      elements.progressBar.style.width = "66%";
    } else {
      elements.summaryText.textContent = `Select a scenario and ${maxSelectedCharacters} characters to begin.`;
      elements.progressBar.style.width = "33%";
    }
    elements.modeToggle.textContent = 'Switch to Reference';
  } else {
    elements.progressBar.style.opacity = 0.25;
    elements.summaryText.textContent = 'Browse scenarios, characters, actions, and events freely.';
    elements.modeToggle.textContent = 'Switch to Play';
  }
}

// Create a standard card container with given child elements.
export function createCard(content) {
  const card = document.createElement('article');
  card.className = 'card';
  card.append(...content);
  return card;
}

// Create a button element with a click handler.
export function createButton(text, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

// Create a text element of a given tag name.
export function createText(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text;
  el.style.whiteSpace = 'pre-line';
  if (className) el.className = className;
  return el;
}

// Create a row of tab buttons for navigation.
export function createTabs(tabNames, activeTab, onSelect) {
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  tabNames.forEach(tabName => {
    const button = createButton(tabName, () => onSelect(tabName));
    if (tabName === activeTab) {
      button.classList.add('active-tab');
    }
    tabs.appendChild(button);
  });
  return tabs;
}

// Show a fullscreen popup overlay for details and modal content.
export function showPopup(title, contentElements) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  const popup = document.createElement('div');
  popup.className = 'popup';

  const header = document.createElement('div');
  header.className = 'popup-header';
  header.append(createText('h3', title));
  const closeButton = createButton('×', () => overlay.remove());
  closeButton.className = 'popup-close';
  header.appendChild(closeButton);

  popup.appendChild(header);
  contentElements.forEach(el => popup.appendChild(el));
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Render a small subset of markdown syntax to HTML fragments.
export function renderMarkdown(markdown) {
  const fragment = document.createDocumentFragment();
  const blocks = markdown.split(/\r?\n\r?\n/);
  blocks.forEach(block => {
    const trimmed = block.trim();
    if (!trimmed) return;
    const lines = trimmed.split(/\r?\n/);
    const first = lines[0].trim();
    if (/^#{1,6}\s+/.test(first)) {
      const level = first.match(/^#+/)[0].length;
      const heading = document.createElement('h' + Math.min(level + 1, 4));
      heading.textContent = first.replace(/^#{1,6}\s+/, '');
      fragment.appendChild(heading);
      lines.slice(1).forEach(line => {
        const p = createText('p', line.trim());
        fragment.appendChild(p);
      });
    } else if (lines.every(line => /^([\-*•]\s+)/.test(line.trim()))) {
      const list = document.createElement('ul');
      lines.forEach(line => {
        const item = document.createElement('li');
        item.textContent = line.replace(/^([\-*•]\s+)/, '').trim();
        list.appendChild(item);
      });
      fragment.appendChild(list);
    } else {
      const paragraph = createText('p', lines.map(line => line.trim()).join(' '));
      fragment.appendChild(paragraph);
    }
  });
  return fragment;
}

// Create a stat row with increment and decrement controls.
export function createStatRow(label, value, onChange, maxValue = null) {
  const row = document.createElement('div');
  row.className = 'input-row';
  const labelEl = createText('label', label);
  const valueDisplay = createText('span', value.toString());
  valueDisplay.className = 'stat-value';
  const decrementBtn = createButton('-', () => {
    const newValue = Math.max(0, value - 1);
    onChange(newValue);
    valueDisplay.textContent = newValue.toString();
  });
  const incrementBtn = createButton('+', () => {
    const newValue = maxValue ? Math.min(maxValue, value + 1) : value + 1;
    onChange(newValue);
    valueDisplay.textContent = newValue.toString();
  });
  const controls = document.createElement('div');
  controls.className = 'stat-controls';
  controls.append(decrementBtn, valueDisplay, incrementBtn);
  row.append(labelEl, controls);
  return [row];
}

// Wrap a title and element into a small details card.
export function createDetailsCard(title, content) {
  const card = createCard([createText('h3', title)]);
  card.appendChild(content);
  return card;
}
