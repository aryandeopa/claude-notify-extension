const audio = document.getElementById("player");

audio.play().catch((err) => {
  console.error("[claude-notify] offscreen audio.play() failed:", err);
});

audio.addEventListener("ended", () => {
  chrome.runtime.sendMessage({ type: "claude-notify-sound-done" });
});
