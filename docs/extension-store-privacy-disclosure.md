# Chrome Web Store Privacy Disclosure

**Extension:** SFYTA3.H-V.A Capture Layer  
**Version:** 1.0.0  
**Manifest:** Manifest V3  
**Effective date:** 2026-09-21  
**Public policy URL:** <https://freakinaudiobookdownloader.vercel.app/privacy/>

## Single purpose

SFYTA3.H-V.A Capture Layer is a browser-toolbar companion that remembers a user-configured SFYTA3.H-V.A Capture Studio URL and opens the visible web application after an explicit user action.

The extension does not record audio in the background. Audio capture, rights confirmation, protected-source decisions, and visible browser permission prompts remain in the web application.

## Data handling

The extension handles one user-provided value: the web-app URL entered in the popup. The value is stored in `chrome.storage.local`, used to prefill the popup and open the selected URL after the user clicks **Open Capture Studio**, and is never transmitted to the developer or another third party.

The extension does not handle browsing history, page content, audio, recordings, credentials, authentication tokens, cookies, payment information, health information, or personal identifiers. It has no analytics, advertising, crash reporting, remote code, content scripts, host permissions, or network interception.

## Permission justification

| Permission | Justification |
|---|---|
| `storage` | Stores the user-entered web-app URL locally so the popup can remember the selected deployment. |

No host permissions are requested. The extension does not request `tabs`, `activeTab`, `downloads`, `webRequest`, `identity`, `notifications`, or clipboard permissions.

## Sharing, sale, and security

No extension data is sold, shared, or transmitted. The extension makes no outbound network requests. The stored URL remains in browser extension storage until the user changes it, clears extension storage, or uninstalls the extension.

## User controls

Users can view and edit the stored URL in the popup, clear extension storage through Chrome settings, use Capture Studio without the extension, or uninstall the extension.

## Rights and protected content

The extension does not bypass DRM, encrypted media, or access controls. It does not create a hidden recorder. Users remain responsible for ensuring that their intended capture is authorized by the relevant rights holder and platform terms.

## Policy change handling

Any material change to data practices will be reflected in this policy, the Chrome Web Store privacy disclosures, and the release documentation before a changed version is submitted.

## Contact

Support and privacy questions may be submitted through the project issue tracker: <https://github.com/bhaifreakinsazzad-ops/freakinaudiobookdownloader/issues>.

## Bengali summary

এই এক্সটেনশন শুধুমাত্র ব্যবহারকারীর দেওয়া ওয়েব অ্যাপের URL স্থানীয়ভাবে সংরক্ষণ করে এবং ব্যবহারকারীর স্পষ্ট ক্লিকের পরে সেই অ্যাপ খোলে। কোনো browsing history, page content, audio, recording, credential, analytics বা third-party transmission নেই। ব্যাকগ্রাউন্ডে recording হয় না এবং DRM bypass করা হয় না।
