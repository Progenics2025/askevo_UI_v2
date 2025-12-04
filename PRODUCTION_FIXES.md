# Production Fixes Summary

## 1. Logo Missing on Login Page
**Issue:** Static path reference `/askevo-logo.png` was failing in production.
**Fix:** Moved the logo to `src/assets/askevo-logo.png` and updated `LoginPage.jsx` to import it explicitly.

## 2. Speech Recognition Error (ERR_BLOCKED_BY_CLIENT)
**Issue:** The user reported `net::ERR_BLOCKED_BY_CLIENT` and speech failures. This indicates a browser extension (AdBlocker) or privacy setting (Brave Shields) is blocking:
1.  The Google Speech API connection (causing "network" errors).
2.  The `responsivevoice.js` script (causing TTS failures).
**Fix:**
- Updated `GenomicsChat.jsx` and `VoiceConversationModal.jsx` to catch `network` and `service-not-allowed` errors and display a specific toast message advising the user to disable AdBlockers/Shields.
- Added an `onerror` handler to the `responsivevoice.js` script tag in `index.html` to log a clear warning if it's blocked.

## 3. NFC Login Flow (OTP Redirect Fix)
**Issue:** After verifying OTP, the application was redirecting to the login page instead of the chat dashboard.
**Fix:**
- **Frontend (`NFCLogin.jsx`):** Updated `handleVerifyOTP` to use `window.location.replace('/')` with a delay.
- **Backend:** Reverted the "Direct Login" change to enforce OTP verification.

## 4. Voice Conversation Demo Data
**Issue:** The Voice Conversation feature was using hardcoded demo data.
**Fix:** Replaced with real `SpeechRecognition` and `ollamaService` integration.

## 5. Sidebar Behavior & Layout
**Issue:**
- Sidebar was floating on desktop (undesired).
- When made static, it caused the main chat content to overflow/cut off.
- Tablet users might prefer floating sidebar.
**Fix:**
- **Breakpoint:** Changed sidebar behavior breakpoint from `md` (768px) to `lg` (1024px). Now, Tablets and Mobile devices use **Floating (Overlay)** sidebar. Laptops and Desktops use **Static (Push)** sidebar.
- **Layout:** Fixed `Dashboard.jsx` flex layout by removing `w-full` and adding `min-w-0` to the main content area. This ensures the chat area shrinks correctly when the sidebar is open on desktop, preventing buttons/text from being cut off.

## Verification
1. **Logo:** Refresh login page to see the logo.
2. **Speech:** If speech fails, check the toast message.
3. **NFC:** Tap card -> Enter OTP -> Verify -> Redirect to Chat.
4. **Voice Mode:** Speak a query.
5. **Sidebar:**
   - **Desktop (>1024px):** Open sidebar -> Content shrinks to fit (nothing cut off). Close sidebar -> Content expands.
   - **Tablet/Mobile (<1024px):** Open sidebar -> Sidebar overlays content.
