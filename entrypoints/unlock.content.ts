import { CMD_EVENT, DATA_ATTR } from '@/lib/protocol';

const BLOCKED_EVENTS = [
  'copy',
  'cut',
  'contextmenu',
  'selectstart',
  'dragstart',
] as const;

const STYLE_ID = 'allow-copy-style';
const STYLE_TEXT = `
html, body, body * {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
  -webkit-touch-callout: default !important;
}
`;

const HANDLER_ATTRS = [
  'oncopy',
  'oncut',
  'oncontextmenu',
  'onselectstart',
  'ondragstart',
  'unselectable',
] as const;

let enabled = false;
let observer: MutationObserver | null = null;

function stopPageHandler(event: Event) {
  event.stopImmediatePropagation();
}

function onKeydown(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === 'c' || key === 'x' || key === 'a') {
    event.stopImmediatePropagation();
  }
}

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE_TEXT;
  (document.head ?? document.documentElement).appendChild(style);
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

function stripNode(node: Document | Element) {
  if (node instanceof Element) {
    for (const attr of HANDLER_ATTRS) node.removeAttribute(attr);
  }

  const target = node as Document | HTMLElement;
  target.oncopy = null;
  target.oncut = null;
  target.oncontextmenu = null;
  target.onselectstart = null;
  target.ondragstart = null;
}

function stripTree(root: Document | Element) {
  stripNode(root);
  if ('querySelectorAll' in root) {
    for (const el of root.querySelectorAll('*')) stripNode(el);
  }
}

function addListeners() {
  for (const type of BLOCKED_EVENTS) {
    document.addEventListener(type, stopPageHandler, true);
    window.addEventListener(type, stopPageHandler, true);
  }
  document.addEventListener('keydown', onKeydown, true);
  window.addEventListener('keydown', onKeydown, true);
}

function removeListeners() {
  for (const type of BLOCKED_EVENTS) {
    document.removeEventListener(type, stopPageHandler, true);
    window.removeEventListener(type, stopPageHandler, true);
  }
  document.removeEventListener('keydown', onKeydown, true);
  window.removeEventListener('keydown', onKeydown, true);
}

function enable() {
  if (enabled) return;
  enabled = true;
  injectStyle();
  addListeners();
  stripTree(document);
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) stripTree(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function disable() {
  if (!enabled) return;
  enabled = false;
  observer?.disconnect();
  observer = null;
  removeListeners();
  removeStyle();
}

function apply(next: boolean) {
  if (next) enable();
  else disable();
}

export default defineContentScript({
  matches: ['*://*/*'],
  allFrames: true,
  matchAboutBlank: true,
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    apply(document.documentElement.hasAttribute(DATA_ATTR));

    document.documentElement.addEventListener(CMD_EVENT, (event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      apply(Boolean(detail?.enabled));
    });
  },
});
