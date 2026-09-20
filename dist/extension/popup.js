const input = document.getElementById("app-url");
const open = document.getElementById("open");

chrome.storage.local.get({ appUrl: "" }, ({ appUrl }) => {
  if (input) input.value = appUrl;
});

open?.addEventListener("click", () => {
  const value = input?.value.trim() || "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost") throw new Error("HTTPS required");
    chrome.storage.local.set({ appUrl: url.toString() });
    chrome.tabs.create({ url: url.toString() });
  } catch {
    if (input) input.setCustomValidity("Enter an HTTPS deployment URL or localhost URL.");
    input?.reportValidity();
  }
});

input?.addEventListener("input", () => input.setCustomValidity(""));
