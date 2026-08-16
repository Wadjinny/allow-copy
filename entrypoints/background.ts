import { MSG, type Message } from '@/lib/protocol';

function tabKey(tabId: number) {
  return `tab:${tabId}`;
}

async function isEnabled(tabId: number | undefined) {
  if (tabId == null) return false;
  const stored = await browser.storage.session.get(tabKey(tabId));
  return stored[tabKey(tabId)] === true;
}

async function setEnabled(tabId: number, enabled: boolean) {
  const key = tabKey(tabId);
  if (enabled) await browser.storage.session.set({ [key]: true });
  else await browser.storage.session.remove(key);

  await browser.action.setBadgeText({ tabId, text: enabled ? 'ON' : '' });
  if (enabled) {
    await browser.action.setBadgeBackgroundColor({ tabId, color: '#16a34a' });
  }
}

function tabIdFrom(message: Message, sender: { tab?: { id?: number } }) {
  return message.tabId ?? sender.tab?.id;
}

export default defineBackground(() => {
  browser.tabs.onRemoved.addListener((tabId) => {
    void browser.storage.session.remove(tabKey(tabId));
  });

  browser.runtime.onMessage.addListener((message: Message, sender) => {
    if (message.type === MSG.GET) {
      return isEnabled(tabIdFrom(message, sender));
    }

    if (message.type === MSG.SET) {
      const tabId = tabIdFrom(message, sender);
      if (tabId == null) return Promise.resolve(false);
      return setEnabled(tabId, message.enabled).then(() => true);
    }
  });
});
