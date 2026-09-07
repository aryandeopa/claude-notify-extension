const STOP_BUTTON_SELECTOR = 'button[aria-label="Stop response"]';
const DIALOG_SELECTOR = '[role="dialog"]';
const PERMISSION_KEYWORDS = /\ballow\b|\bapprove\b|\bgrant access\b|\bconnect\b/i;

let wasResponding = false;
let finishedTimer = null;
const notifiedDialogs = new WeakSet();

function notify(text) {
  chrome.runtime.sendMessage({ type: "claude-notify", text });
}

function checkResponseState() {
  const isResponding = !!document.querySelector(STOP_BUTTON_SELECTOR);

  if (isResponding) {
    wasResponding = true;
    if (finishedTimer) {
      clearTimeout(finishedTimer);
      finishedTimer = null;
    }
    return;
  }

  if (wasResponding && !finishedTimer) {
    // Debounce: ignore brief flickers between tool calls mid-turn.
    finishedTimer = setTimeout(() => {
      finishedTimer = null;
      if (!document.querySelector(STOP_BUTTON_SELECTOR)) {
        wasResponding = false;
        notify("Claude finished responding");
      }
    }, 800);
  }
}

function checkForPermissionDialogs(root) {
  const dialogs = root.matches?.(DIALOG_SELECTOR)
    ? [root]
    : Array.from(root.querySelectorAll?.(DIALOG_SELECTOR) ?? []);

  for (const dialog of dialogs) {
    if (notifiedDialogs.has(dialog)) continue;
    const text = dialog.textContent || "";
    if (PERMISSION_KEYWORDS.test(text)) {
      notifiedDialogs.add(dialog);
      notify("Claude needs your permission to continue");
    }
  }
}

const observer = new MutationObserver((mutations) => {
  checkResponseState();
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        checkForPermissionDialogs(node);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
