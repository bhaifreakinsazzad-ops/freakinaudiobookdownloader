chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PING") return void sendResponse({ ok: true, type: "PONG", recording: false });
  if (message?.type === "GET_STATUS") return void sendResponse({ ok: true, type: "STATUS", recording: false });
  sendResponse({ ok: false, error: "Unsupported or gated message" });
  return false;
});
