chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "claude-notify") return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "Claude",
    message: message.text,
    priority: 2
  });
});
