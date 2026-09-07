const DEFAULTS = { notifyQuestions: true, notifyFinished: true };

const questionsToggle = document.getElementById("questionsToggle");
const finishedToggle = document.getElementById("finishedToggle");
const enableBtn = document.getElementById("enableNotifBtn");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(DEFAULTS, (settings) => {
  questionsToggle.checked = settings.notifyQuestions;
  finishedToggle.checked = settings.notifyFinished;
});

questionsToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ notifyQuestions: questionsToggle.checked });
});

finishedToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ notifyFinished: finishedToggle.checked });
});

enableBtn.addEventListener("click", () => {
  statusEl.textContent = "Sending...";
  chrome.runtime.sendMessage({ type: "claude-notify-test" }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      statusEl.textContent = "Something went wrong — check chrome://extensions for errors.";
      return;
    }
    statusEl.textContent = "Sent! You should see a banner and hear a sound now.";
  });
});
