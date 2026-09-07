let creatingOffscreen = null;

async function ensureOffscreenDocument() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"]
  });
  if (existing.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play a short sound when Claude needs your attention"
  });
  await creatingOffscreen;
  creatingOffscreen = null;
}

async function playSound() {
  try {
    await ensureOffscreenDocument();
  } catch (err) {
    console.error("[claude-notify] failed to create offscreen document:", err);
  }
}

function sendNotification(text, sendResponse) {
  playSound();

  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icon128.png",
      title: "Claude",
      message: text,
      priority: 2
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("[claude-notify] notifications.create failed:", chrome.runtime.lastError.message);
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("[claude-notify] notification created:", notificationId);
        sendResponse({ ok: true, notificationId });
      }
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "claude-notify-sound-done") {
    chrome.offscreen.closeDocument().catch(() => {});
    return;
  }

  if (message?.type === "claude-notify-test") {
    sendNotification("Notifications are working ✓", sendResponse);
    return true;
  }

  if (message?.type !== "claude-notify") return;

  sendNotification(message.text, sendResponse);
  return true; // keep the message channel open for the async sendResponse
});
