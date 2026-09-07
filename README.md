# Claude Notify

A Chrome extension that fires a desktop notification (banner + OS sound) when Claude on
[claude.ai](https://claude.ai) finishes responding or needs your input — in both **Chat**
and **Cowork** mode. Works the same on macOS and Windows since Chrome's notification API
handles the OS integration.

This does **not** cover the native Claude Desktop app — extensions can't be loaded into it.

## Install (unpacked, both macOS and Windows)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this folder (`claude-notify-extension`).
4. Open [claude.ai](https://claude.ai) and send a message — you should get a notification
   once Claude finishes responding.

## What it detects

- **Response finished** (Chat or Cowork): watches for `button[aria-label="Stop response"]`
  appearing while Claude streams and disappearing when it's done. An 800ms debounce avoids
  false positives from brief pauses between tool calls mid-turn.
- **Permission needed**: watches for new dialogs (`[role="dialog"]`) whose text mentions
  "allow", "approve", "grant access", or "connect" — e.g. a connector authorization prompt.
  This is a best-effort heuristic; it wasn't verified against a real connector-approval
  dialog, so if it misses one, tighten `PERMISSION_KEYWORDS` in `content.js`.

## Files

- `manifest.json` — extension manifest (Manifest V3)
- `background.js` — creates the OS notification
- `content.js` — watches the claude.ai page and messages the background script
- `icon128.png` — placeholder icon, swap for your own if you want
