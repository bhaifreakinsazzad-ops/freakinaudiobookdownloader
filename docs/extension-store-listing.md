# Extension Store Listing

## Name

SFYTA3.H-V.A Capture Layer

## Short description

Optional least-privilege companion for explicit, rights-aware SFYTA3.H-V.A workflows.

## Full description

SFYTA3.H-V.A is a local-first audio capture studio. This Manifest V3 companion provides a popup for configuring the deployed web-app URL, a health/status surface, and an explicit handoff to the web application.

The companion is intentionally conservative: it does not record in the background, does not bypass DRM or protected media, and rejects capture requests until the web application's rights confirmation, protected-source decision, and visible browser permission flow authorize a session. The web application remains fully functional without installing this extension.

## Permissions rationale

- `storage`: stores the user-entered web-app deployment URL locally in the extension.

## Privacy

The starter does not upload audio, does not create hidden recordings, and does not connect to a production cloud service. Users should review the web application's privacy policy before enabling any future integration.

## Review notes

This package is a companion, not a background-capture product. Before store submission, complete store-specific privacy disclosures, automated browser tests, and a reviewed user-consent flow for any future capture integration.
