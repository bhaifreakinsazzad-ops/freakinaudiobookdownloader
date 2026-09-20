# Extension Store Privacy Disclosure

**For:** Chrome Web Store, Firefox Add-ons, Microsoft Edge Add-ons  
**Extension Name:** SFYTA3.H-V.A Capture Layer  
**Version:** 1.0.0  
**Date:** 2026-09-20

## 1. Single-Purpose Statement

**SFYTA3.H-V.A helps users capture, organize, and download audio from authorized web sources they have the right to archive, with built-in rights confirmation and protected-content blocking.**

This Manifest V3 extension is an optional companion surface for the SFYTA3.H-V.A web application. It provides:
- A popup interface for configuring the deployed web app URL
- Health/status indicators for extension connectivity
- An explicit handoff mechanism to launch the web application

The extension **does not**:
- Record audio in the background
- Access web page content without explicit user action
- Bypass DRM or protected media
- Upload any data to remote servers
- Function independently of the web application

## 2. Data Collection Practices

### 2.1 Data Collected by the Extension

| Data Type | Purpose | Storage Location | Retention |
|-----------|---------|------------------|-----------|
| Web app URL (user-entered) | Configure extension handoff target | Chrome/Firefox local storage (`chrome.storage.local`) | Until user clears or uninstalls |
| Extension health status | Display operational state in popup | Temporary runtime memory | Session only |

### 2.2 Data NOT Collected

The extension does **not** collect, access, or transmit:
- Browsing history
- Audio content or recordings
- User credentials or authentication tokens
- Personal identifiers (name, email, etc.)
- Cookies from any websites
- Tab URLs or page content (beyond what user explicitly shares via web app)

## 3. Permissions Requested

### 3.1 Required Permissions

```json
{
  "permissions": ["storage"]
}
```

| Permission | Justification | Store Policy Category |
|------------|---------------|----------------------|
| `storage` | Stores user-configured web app deployment URL locally. Required for extension popup to remember user's self-hosted instance address. | Minimal; no sensitive data access |

### 3.2 Permissions NOT Requested

The extension explicitly does **not** request:
- `tabs` - No need to enumerate or monitor tabs
- `activeTab` - No page content access required
- `<all_urls>` or host permissions - No content scripts injected
- `webRequest` - No network interception
- `downloads` - Downloads handled by web app, not extension
- `notifications` - Notifications handled by web app via browser APIs
- `clipboardRead`/`clipboardWrite` - No clipboard access needed
- `identity` - No OAuth or account integration

## 4. Content Script Safety

### 4.1 No Content Scripts

This extension **does not inject content scripts** into any web pages. All functionality operates within:
- Extension popup (isolated context)
- Service worker background script (isolated context)

### 4.2 Message Validation

Communication between extension components follows these rules:
- Popup ↔ Service Worker: Internal extension messaging only
- Extension ↔ Web App: Handoff via explicit URL launch (no programmatic control)
- No messages accepted from external web pages
- No commands executable from web page JavaScript

### 4.3 Origin Checking

The extension stores only a user-provided URL string. It does not:
- Validate or verify the URL points to a legitimate SFYTA3.H-V.A instance
- Prevent users from entering arbitrary URLs (user responsibility)
- Make requests to the stored URL on behalf of the user

## 5. Data Transmission

### 5.1 Outbound Network Requests

The extension **makes no outbound network requests**. All network activity occurs within the web application running in the browser tab.

### 5.2 Third-Party Services

The extension does not integrate with:
- Analytics services (Google Analytics, Mixpanel, etc.)
- Crash reporting services
- Advertising networks
- Social media platforms
- Any third-party APIs

## 6. Local Storage Security

### 6.1 Stored Data

The extension stores in `chrome.storage.local`:
```json
{
  "webAppUrl": "https://user-configured-instance.example.com"
}
```

### 6.2 Security Characteristics

- Data is stored in browser's extension storage (sandboxed per-extension)
- Not accessible to web pages or other extensions
- Cleared when extension is uninstalled
- Not synchronized to cloud by default (unless user enables Chrome sync)

### 6.3 No Secrets Stored

The extension does **not** store:
- API keys
- Authentication tokens
- Passwords
- Encryption keys
- Any credentials

## 7. Telemetry and Analytics

### 7.1 Current Implementation

**No telemetry is collected.** The extension:
- Does not phone home
- Does not report usage statistics
- Does not track feature adoption
- Does not send crash reports
- Has no analytics SDK

### 7.2 Future Changes

If telemetry is ever added:
- It will be opt-in only
- Clearly disclosed in updated privacy policy
- Limited to anonymized usage counts
- Will never include audio content or PII
- Users can disable at any time

## 8. User Controls

Users can:
- View stored web app URL in extension popup
- Modify the stored URL at any time
- Clear extension data via browser settings
- Uninstall extension to remove all stored data
- Use the web application without installing the extension

## 9. Children's Privacy

The extension is not directed at children under 13 (or applicable age in jurisdiction). The extension:
- Does not knowingly collect data from children
- Does not require age verification
- Should be used under adult supervision if used by minors

Parents should review the companion web application's privacy policy before allowing children to use SFYTA3.H-V.A.

## 10. Changes to This Disclosure

Material changes to data practices will be:
- Documented in extension store listing updates
- Communicated through extension changelog
- Reflected in updated privacy policy linked from store listing

## 11. Contact Information

For privacy-related questions about this extension:
- Refer to project repository contact information
- Review companion web application privacy policy at: `[USER_CONFIGURED_URL]/privacy`

---

## Store Listing Compliance Checklist

- [x] Single-purpose statement provided
- [x] All permissions justified
- [x] No unnecessary permissions requested
- [x] Data collection practices disclosed
- [x] Third-party integrations disclosed (none)
- [x] Telemetry practices disclosed (none)
- [x] Children's privacy addressed
- [x] Contact mechanism provided
- [x] Privacy policy link available (in web app)

## Bengali Summary (বাংলা সারাংশ)

এই এক্সটেনশন শুধুমাত্র ব্যবহারকারীর কনফিগার করা ওয়েব অ্যাপ URL সংরক্ষণ করে। কোনো ডেটা সংগ্রহ বা প্রেরণ করা হয় না। ব্যাকগ্রাউন্ডে রেকর্ডিং হয় না, DRM বাইপাস করা হয় না, এবং কোনো অ্যানালিটিক্স সংগ্রহ করা হয় না।
