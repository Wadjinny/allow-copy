# Allow Copy

Browser extension that unlocks text selection and copy on pages that block it. Enable it from the popup for the current tab.

## Usage

1. Open a normal `http(s)` page.
2. Click the extension icon.
3. Choose **Enable on this page**.
4. Select text and copy with Ctrl+C / ⌘C or right-click.

The toolbar badge shows **ON** while it is enabled on that tab. It stays on across reloads until you disable it.

It does not run on `chrome://` pages, the Chrome Web Store, or other restricted URLs. If a tab was already open when you loaded the extension, reload that page once after enabling.

## Develop

```bash
npm install
npm run dev
```

WXT launches Chrome with the extension loaded and reloads on save.

```bash
npm run dev:firefox   # Firefox instead of Chrome
npm run compile       # Typecheck
npm run build         # Production build → .output/chrome-mv3
npm run zip           # Pack a zip for distribution
```

## How it works

The popup toggles a per-tab flag. A content script then:

- Forces `user-select: text` so selection is allowed
- Stops page handlers that cancel copy, cut, select, or right-click
- Strips inline `oncopy` / `oncut` / `oncontextmenu` handlers

## Stack

WXT, TypeScript, Manifest V3.
