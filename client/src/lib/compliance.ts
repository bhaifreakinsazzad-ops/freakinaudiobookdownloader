export type ComplianceLicense =
  | "authorized"
  | "public-domain"
  | "unknown"
  | "blocked";

export interface SourceSignals {
  url: string;
  title?: string;
  drmDetected?: boolean;
  licenseStatus?: ComplianceLicense;
}
export interface ComplianceDecision {
  allowed: boolean;
  drmDetected: boolean;
  reason: string;
}

const PROTECTED_PATTERNS = [
  /encrypted-media/i,
  /eme/i,
  /drm/i,
  /widevine/i,
  /fairplay/i,
  /playready/i,
  /license/i,
  /protected/i,
];

export function evaluateSource(signals: SourceSignals): ComplianceDecision {
  const text = `${signals.url} ${signals.title || ""}`;
  const drmDetected =
    Boolean(signals.drmDetected) ||
    signals.licenseStatus === "blocked" ||
    PROTECTED_PATTERNS.some(pattern => pattern.test(text));
  if (drmDetected)
    return {
      allowed: false,
      drmDetected: true,
      reason:
        "Protected media or license-control signal detected; capture is blocked.",
    };
  if (signals.licenseStatus === "unknown")
    return {
      allowed: false,
      drmDetected: false,
      reason:
        "Source authorization is unknown; confirm an authorized source before capture.",
    };
  return {
    allowed: true,
    drmDetected: false,
    reason:
      "No protected-media signal detected; user rights confirmation is still required.",
  };
}

export function canStartCapture(input: {
  rightsConfirmed: boolean;
  sourceBlocked: boolean;
  mediaCaptureAvailable: boolean;
}) {
  if (input.sourceBlocked)
    return {
      allowed: false,
      reason: "Capture is blocked for this protected source.",
    };
  if (!input.rightsConfirmed)
    return {
      allowed: false,
      reason: "Rights confirmation is required before capture.",
    };
  if (!input.mediaCaptureAvailable)
    return {
      allowed: false,
      reason: "Browser display-audio capture is unavailable.",
    };
  return { allowed: true, reason: "Capture prerequisites satisfied." };
}
