import { describe, expect, it } from "vitest";
import { canStartCapture, evaluateSource } from "./compliance";

describe("compliance decisions", () => {
  it("blocks protected media signals and license-controlled URLs", () => {
    expect(
      evaluateSource({
        url: "https://media.example/license/widevine",
        licenseStatus: "authorized",
      })
    ).toMatchObject({ allowed: false, drmDetected: true });
    expect(
      evaluateSource({
        url: "https://example.com/audio",
        drmDetected: true,
        licenseStatus: "authorized",
      }).allowed
    ).toBe(false);
  });

  it("requires authorized source status and explicit rights confirmation", () => {
    expect(
      evaluateSource({
        url: "https://example.com/audio",
        licenseStatus: "unknown",
      }).allowed
    ).toBe(false);
    expect(
      canStartCapture({
        rightsConfirmed: false,
        sourceBlocked: false,
        mediaCaptureAvailable: true,
      })
    ).toMatchObject({
      allowed: false,
      reason: "Rights confirmation is required before capture.",
    });
    expect(
      canStartCapture({
        rightsConfirmed: true,
        sourceBlocked: false,
        mediaCaptureAvailable: true,
      }).allowed
    ).toBe(true);
  });

  it("blocks capture when protected or browser capture is unavailable", () => {
    expect(
      canStartCapture({
        rightsConfirmed: true,
        sourceBlocked: true,
        mediaCaptureAvailable: true,
      }).allowed
    ).toBe(false);
    expect(
      canStartCapture({
        rightsConfirmed: true,
        sourceBlocked: false,
        mediaCaptureAvailable: false,
      }).allowed
    ).toBe(false);
  });
});
