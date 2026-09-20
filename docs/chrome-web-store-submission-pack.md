# Chrome Web Store Submission Pack

**Product:** SFYTA3.H-V.A Capture Layer  
**Package version:** 1.0.0  
**Manifest:** Manifest V3  
**Prepared for:** Future public Chrome Web Store submission  
**Prepared by:** Manus AI  
**Last reviewed:** 2026-09-21

## Submission status

The extension is technically packaged and publicly downloadable, but it has **not** been submitted to the Chrome Web Store. The package is ready for a publisher to complete the developer account, business contact, payment, and final dashboard declarations.

The current implementation is a narrow companion extension. It stores a user-entered web-app URL, displays a small status surface, and opens the web application after an explicit click. It does not capture audio independently, inject scripts into pages, inspect browsing activity, or transmit extension data to a remote service.

## 1. Listing metadata

| Chrome Web Store field | Submission value |
|---|---|
| Name | SFYTA3.H-V.A Capture Layer |
| Short description | Configure and open the SFYTA3.H-V.A capture studio with a minimal, rights-aware Chrome companion. |
| Category | Productivity |
| Language | English |
| Version | 1.0.0 |
| Manifest version | 3 |
| Homepage | https://freakinaudiobookdownloader.vercel.app/extension/ |
| Support URL | https://github.com/bhaifreakinsazzad-ops/freakinaudiobookdownloader/issues |
| Privacy policy URL | https://freakinaudiobookdownloader.vercel.app/privacy/ |
| Public install page | https://freakinaudiobookdownloader.vercel.app/extension/ |
| Package download | https://freakinaudiobookdownloader.vercel.app/downloads/sfyta3-h-v-a-extension.zip |
| Distribution recommendation | Public, after publisher identity and policy declarations are complete |
| In-app purchases | None |
| Ads | None |
| Remote code | None |

### Full description

SFYTA3.H-V.A Capture Layer is a minimal Manifest V3 companion for the SFYTA3.H-V.A local-first capture studio.

Use the extension popup to save the HTTPS address of your deployed Capture Studio and open it with one click. The companion provides a small health/status surface and an explicit handoff to the visible web application.

The extension is intentionally limited. It does not record audio in the background, read page content, inject scripts, monitor tabs, bypass DRM, or upload extension data. Audio capture remains inside the web application and requires the user’s visible browser permission flow and rights confirmation. The web application blocks protected or unknown-authority sources.

The extension requests only the `storage` permission so it can remember the user-entered web-app URL locally. Users may change or remove that URL at any time, use the web application without the extension, or uninstall the extension to clear its local data.

SFYTA3.H-V.A is not affiliated with or endorsed by any third-party media platform named in user-configured URLs.

## 2. Single-purpose statement

> SFYTA3.H-V.A Capture Layer provides a minimal browser-toolbar companion that remembers a user-configured Capture Studio URL and opens the visible, rights-aware web application on explicit user action.

This statement is intentionally narrower than the web application’s wider audio-capture capabilities. The extension itself does not independently perform those capabilities.

## 3. Permission and API declarations

| Permission or API | Required? | Exact justification |
|---|---:|---|
| `storage` | Yes | Stores the user-entered web-app URL in `chrome.storage.local` so the popup can remember the user’s selected deployment between uses. |
| `action` | Yes | Provides the toolbar button and popup through which the user configures and opens the web app. |
| `background.service_worker` | Yes | Handles the extension’s internal health/status message contract without page access or background recording. |
| Host permissions | No | The extension does not access, inject into, or monitor any website. |
| `tabs` / `activeTab` | No | The extension does not inspect or control the current tab. |
| `downloads` | No | Audio and file downloads are handled by the web application after user action. |
| `webRequest` | No | The extension does not intercept network requests. |
| `identity` | No | The extension has no account or OAuth flow. |

### Data-use declaration

The extension handles one user-provided value: the web-app URL entered in the popup. It is stored locally in `chrome.storage.local`, used only to prefill the popup and open the URL after the user clicks the action button, and is not transmitted to the developer or any third party. Runtime health/status values remain in memory for the current extension session.

The extension does not handle browsing history, page content, audio, recordings, credentials, authentication tokens, cookies, payment information, health information, or personal identifiers.

## 4. Privacy practices answers

Use these answers in the Chrome Web Store Developer Dashboard. Confirm each answer against the exact package being submitted.

| Dashboard question | Answer for version 1.0.0 |
|---|---|
| Does the extension collect or transmit user data? | Yes, it handles locally stored user-provided data: the web-app URL. It does not transmit that value. |
| Is data sold? | No. |
| Is data used for purposes unrelated to the extension’s single purpose? | No. |
| Is data used for creditworthiness, lending, or personalized advertising? | No. |
| Is data transferred to third parties? | No. |
| Is a privacy policy provided? | Yes. Use https://freakinaudiobookdownloader.vercel.app/privacy/. |
| Does the extension use authentication or financial information? | No. |
| Does the extension use browsing activity or website content? | No. |
| Does the extension contain ads or analytics? | No. |
| Does the extension include in-app purchases? | No. |
| Does the extension use remote code? | No. |
| Does the extension inject content scripts? | No. |

Because the URL is user-provided data, the publisher should still disclose it in the dashboard even though it is stored locally and never transmitted.

## 5. Review-team notes

### Reviewer installation path

1. Download the ZIP from the public package URL or upload the release ZIP from `dist/sfyta3-h-v-a-extension.zip`.
2. Unzip it.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose the extracted extension directory.
6. Pin the extension and open the popup.
7. Enter `https://freakinaudiobookdownloader.vercel.app/` or another HTTPS deployment controlled by the tester.
8. Click **Open Capture Studio**.
9. Confirm that the web app opens in a new tab and that no page permissions are requested.

### Expected behavior

The popup saves the URL locally and opens it only after the user clicks the button. Invalid non-HTTPS URLs are rejected, except for localhost development URLs. The service worker responds to internal `PING` and `GET_STATUS` messages and reports `recording: false`. Unsupported capture requests are rejected by the extension message contract.

### Explicit non-behaviors

The extension does not record when the popup is closed. It does not create hidden captures. It does not bypass media protections. It does not access page content, browsing history, cookies, credentials, or network traffic. It does not contact an external API.

## 6. Required publisher inputs before submission

The following values cannot be safely invented in repository metadata and must be completed by the publisher in the Chrome Web Store account:

- Verified developer account and publisher display name.
- Publisher support email and physical business or contact address, if requested by the dashboard.
- Final ownership and trademark review for the product name and icon.
- Final screenshots that show the popup and the public installer or Capture Studio handoff.
- Final distribution countries and visibility choice.
- Confirmation that no paid features, advertisements, or affiliate relationships are introduced before submission.

## 7. Asset checklist

| Asset | Current status | Submission action |
|---|---|---|
| Manifest V3 package | Ready | Upload `dist/sfyta3-h-v-a-extension.zip`. |
| 128px extension icon | Ready | Included at `icons/icon-128.svg`. Confirm dashboard accepts the supplied format or convert to PNG if required by the upload UI. |
| Store icon and promotional tile | Not prepared as a dedicated store asset | Create final PNG assets using the brand mark and Chrome Web Store image dimensions required at submission time. |
| Screenshots | Not prepared | Capture the popup, URL configuration, status surface, and handoff to Capture Studio without showing private data. |
| Privacy policy | Ready | Use the hosted privacy URL in this pack. |
| Support page | Ready | Use the GitHub Issues URL in this pack. |
| Reviewer instructions | Ready | Paste the notes from section 5 into the dashboard review notes field if available. |

## 8. Pre-submission acceptance checklist

- [ ] Publisher identity and contact details are verified.
- [ ] The final ZIP is generated from the exact commit being submitted.
- [ ] `manifest.json` has `manifest_version: 3`, version `1.0.0`, a valid description, and the expected icon.
- [ ] The package contains no secrets, development URLs, source maps, or unused permissions.
- [ ] The public privacy policy URL returns HTTP 200.
- [ ] The support URL is monitored by a responsible maintainer.
- [ ] The listing description matches the extension’s actual behavior.
- [ ] The privacy practices form matches the extension’s actual data handling.
- [ ] Screenshots contain no private URLs, credentials, or personal data.
- [ ] The extension is tested on a current stable Chrome desktop release.
- [ ] A rollback copy of the submitted ZIP and metadata is retained.
- [ ] The publisher has reviewed current Chrome Web Store policies immediately before submission.

## References

[1]: https://developer.chrome.com/docs/webstore "Chrome Web Store documentation"
[2]: https://developer.chrome.com/docs/webstore/program-policies/policies "Chrome Web Store Developer Program Policies"
[3]: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq "Chrome Web Store User Data FAQ"
[4]: https://developer.chrome.com/docs/extensions/reference/manifest "Chrome Extensions Manifest file format"
[5]: https://developer.chrome.com/docs/webstore/cws-dashboard-listing "Chrome Web Store listing information"
[6]: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy "Chrome Web Store privacy practices"
[7]: https://developer.chrome.com/docs/webstore/images "Chrome Web Store image guidelines"
