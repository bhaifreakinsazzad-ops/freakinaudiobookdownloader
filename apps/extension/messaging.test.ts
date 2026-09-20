import { describe, expect, it } from "vitest";
import { handleExtensionMessage } from "./messaging";

describe("extension messaging", () => {
  it("answers health and status messages without recording", () => {
    expect(handleExtensionMessage({ type: "PING" })).toEqual({
      ok: true,
      type: "PONG",
      recording: false,
    });
    expect(handleExtensionMessage({ type: "GET_STATUS" })).toEqual({
      ok: true,
      type: "STATUS",
      recording: false,
    });
  });
  it("rejects malformed and unsupported messages", () => {
    expect(handleExtensionMessage(null).ok).toBe(false);
    expect(
      handleExtensionMessage({ type: "CAPTURE_REQUEST", tabId: -1 })
    ).toMatchObject({ ok: false });
    expect(handleExtensionMessage({ type: "NOPE" })).toMatchObject({
      ok: false,
    });
  });
  it("does not enable capture outside the application rights gate", () => {
    expect(
      handleExtensionMessage({ type: "CAPTURE_REQUEST", tabId: 3 })
    ).toMatchObject({
      ok: false,
      error: expect.stringContaining("rights gate"),
    });
  });
});
