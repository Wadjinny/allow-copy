import './style.css';
import { MSG } from '@/lib/protocol';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <h1>Allow Copy</h1>
  <p class="subtitle">Unlock selection and copy on this page.</p>
  <button id="toggle" type="button" disabled>Checking page…</button>
  <p id="status" class="status"></p>
`;

const toggle = document.querySelector<HTMLButtonElement>('#toggle')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;

let enabled = false;

function setStatus(text: string, isError = false) {
  status.textContent = text;
  status.classList.toggle('error', isError);
}

function render() {
  toggle.disabled = false;
  toggle.classList.toggle('active', enabled);
  toggle.textContent = enabled ? 'Disable on this page' : 'Enable on this page';
  setStatus(
    enabled
      ? 'Select any text, then copy with Ctrl+C / ⌘C or right-click.'
      : 'Click enable to turn off copy blocking on this tab.',
  );
}

function isRestrictedUrl(url: string | undefined) {
  if (!url) return true;
  return !/^https?:/.test(url);
}

async function getActiveTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function applyToTab(tabId: number, next: boolean) {
  try {
    await browser.tabs.sendMessage(tabId, { type: MSG.SET, enabled: next });
    return true;
  } catch {
    return false;
  }
}

async function init() {
  const tab = await getActiveTab();
  if (!tab?.id || isRestrictedUrl(tab.url)) {
    toggle.textContent = 'Unavailable here';
    setStatus('Open a normal website tab, then try again.', true);
    return;
  }

  enabled = Boolean(
    await browser.runtime.sendMessage({ type: MSG.GET, tabId: tab.id }),
  );
  render();

  if (enabled) {
    const reached = await applyToTab(tab.id, true);
    if (!reached) {
      setStatus('Reload this page to apply Allow Copy.', true);
    }
  }

  toggle.addEventListener('click', onToggle);
}

async function onToggle() {
  const tab = await getActiveTab();
  if (!tab?.id || isRestrictedUrl(tab.url)) {
    setStatus('Open a normal website tab, then try again.', true);
    return;
  }

  const next = !enabled;
  toggle.disabled = true;

  await browser.runtime.sendMessage({
    type: MSG.SET,
    enabled: next,
    tabId: tab.id,
  });

  const reached = await applyToTab(tab.id, next);
  enabled = next;
  render();

  if (!reached) {
    setStatus('Reload this page to apply Allow Copy.', true);
  }
}

void init();
