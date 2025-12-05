# Production Fixes Summary

## 1. Logo Visibility
**Issue:** The logo was visible on localhost but missing on `chat.progenicslabs.com`.
**Root Cause:**
- `localhost:5173` uses the **Dev Server** (Live code).
- `chat.progenicslabs.com` uses the **Backend Server** (Port 3001), which serves the **Production Build** (`frontend/dist`).
- The `dist` folder was outdated and didn't contain the new logo or code changes.
**Fix:**
- **Manual Build:** Ran `npm run build` to update the production assets immediately.
- **Startup Script:** Updated `start-all.sh` to automatically run `npm run build` every time services are started, ensuring production is always in sync with code.
- **Code:** Updated `LoginPage.jsx` to use the new `askEVO_logo.png` provided by the user.

## 2. Sidebar Aesthetics
**Issue:**
- The user requested removal of the DNA icon SVG from the sidebar header.
- The user requested the sidebar logo be **centered** and **40% larger**.
**Fix:**
- Removed the `Dna` icon component.
- Updated `Sidebar.jsx` to center the logo using flexbox and increased its height from `h-8` (32px) to `h-11` (44px).
- Positioned the "Close Sidebar" button absolutely to the right to maintain balance.

## 3. Speech Recognition Error (ERR_BLOCKED_BY_CLIENT)
**Issue:** The user reported `net::ERR_BLOCKED_BY_CLIENT` and speech failures. This indicates a browser extension (AdBlocker) or privacy setting (Brave Shields) is blocking:
1.  The Google Speech API connection (causing "network" errors).
2.  The `responsivevoice.js` script (causing TTS failures).
**Fix:**
- Updated `GenomicsChat.jsx` and `VoiceConversationModal.jsx` to catch `network` and `service-not-allowed` errors and display a specific toast message advising the user to disable AdBlockers/Shields.
- Added an `onerror` handler to the `responsivevoice.js` script tag in `index.html` to log a clear warning if it's blocked.

## 4. NFC Login Flow (OTP Redirect Fix)
**Issue:** After verifying OTP, the application was redirecting to the login page instead of the chat dashboard.
**Fix:**
- **Frontend (`NFCLogin.jsx`):** Updated `handleVerifyOTP` to use `window.location.replace('/')` with a delay.
- **Backend:** Reverted the "Direct Login" change to enforce OTP verification.

## 5. Voice Conversation Demo Data
**Issue:** The Voice Conversation feature was using hardcoded demo data.
**Fix:** Replaced with real `SpeechRecognition` and `ollamaService` integration.

## 6. Sidebar Behavior & Layout
**Issue:**
- Sidebar was floating on desktop (undesired).
- When made static, it caused the main chat content to overflow/cut off.
- Tablet users might prefer floating sidebar.
**Fix:**
- **Breakpoint:** Changed sidebar behavior breakpoint from `md` (768px) to `lg` (1024px). Now, Tablets and Mobile devices use **Floating (Overlay)** sidebar. Laptops and Desktops use **Static (Push)** sidebar.
- **Layout:** Fixed `Dashboard.jsx` flex layout by removing `w-full` and adding `min-w-0` to the main content area. This ensures the chat area shrinks correctly when the sidebar is open on desktop, preventing buttons/text from being cut off.

## Verification
1. **Logo:** Refresh `chat.progenicslabs.com`. You should see the new logo image.
2. **Sidebar:** The logo should be centered and larger. The DNA icon should be gone.
3. **Speech:** If speech fails, check the toast message.
4. **NFC:** Tap card -> Enter OTP -> Verify -> Redirect to Chat.
5. **Voice Mode:** Speak a query.
