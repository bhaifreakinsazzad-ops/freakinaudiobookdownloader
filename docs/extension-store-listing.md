# Chrome Web Store Listing Draft

**Extension:** SFYTA3.H-V.A Capture Layer  
**Version:** 1.0.0  
**Manifest:** Manifest V3  
**Category:** Productivity  
**Homepage:** <https://freakinaudiobookdownloader.vercel.app/extension/>  
**Privacy policy:** <https://freakinaudiobookdownloader.vercel.app/privacy/>  
**Support:** <https://github.com/bhaifreakinsazzad-ops/freakinaudiobookdownloader/issues>

## Name

SFYTA3.H-V.A Capture Layer

## Short description

Configure and open the SFYTA3.H-V.A capture studio with a minimal, rights-aware Chrome companion.

## Full description

SFYTA3.H-V.A Capture Layer is a minimal Manifest V3 companion for the SFYTA3.H-V.A local-first capture studio.

Use the extension popup to save the HTTPS address of your deployed Capture Studio and open it with one click. The companion provides a small health/status surface and an explicit handoff to the visible web application.

The extension is intentionally limited. It does not record audio in the background, read page content, inject scripts, monitor tabs, bypass DRM, or upload extension data. Audio capture remains inside the visible web application and requires the user’s browser permission flow and rights confirmation. The web application blocks protected or unknown-authority sources.

The extension requests only the `storage` permission so it can remember the user-entered web-app URL locally. Users may change or remove that URL at any time, use the web application without the extension, or uninstall the extension to clear its local data.

SFYTA3.H-V.A is not affiliated with or endorsed by any third-party platform named in user-configured URLs.

## Single-purpose statement

> Provides a minimal browser-toolbar companion that remembers a user-configured Capture Studio URL and opens the visible, rights-aware web application on explicit user action.

## Permissions rationale

The `storage` permission is required to save the user-entered web-app URL in `chrome.storage.local`. The extension requests no host permissions, content-script access, tab access, network interception, identity access, downloads access, or notification access.

## Privacy disclosure

The extension handles the user-entered web-app URL locally and does not transmit it. It does not handle browsing history, page content, audio, recordings, credentials, authentication tokens, cookies, payment information, health information, or personal identifiers. The complete policy is published at <https://freakinaudiobookdownloader.vercel.app/privacy/>.

## Review notes

Install the unpacked package, open the popup, enter `https://freakinaudiobookdownloader.vercel.app/`, and click **Open Capture Studio**. The extension stores the URL locally and opens a new tab after the explicit click. It does not record in the background, access page content, request host permissions, or contact external APIs.

## Store assets still required

The package and icon are ready. Before submission, prepare final store screenshots and any dashboard-specific promotional images in the dimensions required by the current Chrome Web Store image guidelines. Do not include private URLs, credentials, or unsupported claims in those assets.
