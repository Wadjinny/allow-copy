import { CMD_EVENT, DATA_ATTR, MSG, type Message } from '@/lib/protocol';

function sendToPage(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) root.setAttribute(DATA_ATTR, 'on');
  else root.removeAttribute(DATA_ATTR);

  root.dispatchEvent(
    new CustomEvent(CMD_EVENT, {
      detail: { enabled },
      bubbles: true,
    }),
  );
}

export default defineContentScript({
  matches: ['*://*/*'],
  allFrames: true,
  matchAboutBlank: true,
  runAt: 'document_start',
  async main() {
    const enabled = await browser.runtime.sendMessage({ type: MSG.GET });
    sendToPage(Boolean(enabled));

    browser.runtime.onMessage.addListener((message: Message) => {
      if (message.type === MSG.GET) return Promise.resolve({ enabled: document.documentElement.hasAttribute(DATA_ATTR) });
      if (message.type === MSG.SET) {
        sendToPage(message.enabled);
        return Promise.resolve({ enabled: message.enabled });
      }
    });
  },
});
