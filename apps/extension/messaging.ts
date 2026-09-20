export type ExtensionMessage =
  | { type: "PING" }
  | { type: "GET_STATUS" }
  | { type: "CAPTURE_REQUEST"; tabId: number };
export type ExtensionResponse =
  | { ok: true; type: "PONG" | "STATUS"; recording: false }
  | { ok: false; error: string };

export function handleExtensionMessage(message: unknown): ExtensionResponse {
  if (!message || typeof message !== "object" || !("type" in message))
    return { ok: false, error: "Invalid extension message" };
  const type = (message as { type?: unknown }).type;
  if (type === "PING") return { ok: true, type: "PONG", recording: false };
  if (type === "GET_STATUS")
    return { ok: true, type: "STATUS", recording: false };
  if (type === "CAPTURE_REQUEST") {
    const tabId = (message as { tabId?: unknown }).tabId;
    if (typeof tabId !== "number" || !Number.isInteger(tabId) || tabId < 0)
      return { ok: false, error: "A valid tab id is required" };
    return {
      ok: false,
      error:
        "Capture requires an explicit app rights gate and is not enabled by the starter",
    };
  }
  return { ok: false, error: "Unsupported extension message" };
}
