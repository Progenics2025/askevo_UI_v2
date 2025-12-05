# Production Fixes Summary

## 1. Logo Visibility
**Issue:** The logo was visible on localhost but missing on `chat.progenicslabs.com`.
**Fix:**
- **Manual Build:** Ran `npm run build` to update the production assets immediately.
- **Startup Script:** Updated `start-all.sh` to automatically run `npm run build` every time services are started.
- **Code:** Updated `LoginPage.jsx` to use the new `askEVO_logo.png` provided by the user.

## 2. Sidebar Aesthetics
**Issue:**
- The user requested removal of the DNA icon SVG from the sidebar header.
- The user requested the sidebar logo be **centered** and **larger**.
- The user requested the sidebar background match the **Login Page dark theme**.
- The user requested **pure white text** for better visibility.
- The user requested removal of "by Progenics" text.
**Fix:**
- Removed the `Dna` icon component.
- **Logo:** Centered, increased size to `h-14` (approx +30% from h-11), and removed "by Progenics" tagline.
- **Theme Update:** Applied `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` to the sidebar container.
- **Text Update:** Updated all text colors to `text-white` (including Pedigree Chart button, Chat History, User Email, etc.) to ensure maximum visibility on the dark background.

## 3. Speech Recognition Error (ERR_BLOCKED_BY_CLIENT)
**Issue:** The user reported `net::ERR_BLOCKED_BY_CLIENT` and speech failures.
**Fix:**
- Updated `GenomicsChat.jsx` and `VoiceConversationModal.jsx` to catch `network` and `service-not-allowed` errors and display a specific toast message.
- Added an `onerror` handler to the `responsivevoice.js` script tag in `index.html`.

## 4. NFC Login Flow (OTP Redirect Fix)
**Issue:** After verifying OTP, the application was redirecting to the login page instead of the chat dashboard.
**Fix:**
- **Frontend (`NFCLogin.jsx`):** Updated `handleVerifyOTP` to use `window.location.replace('/')` with a delay.
- **Backend:** Reverted the "Direct Login" change to enforce OTP verification.

## 5. Voice Conversation Demo Data
**Issue:** The Voice Conversation feature was using hardcoded demo data.
**Fix:** Replaced with real `SpeechRecognition` and `ollamaService` integration.

## 6. Sidebar Behavior & Layout
**Issue:** Sidebar floating/static behavior and layout overflow.
**Fix:**
- **Breakpoint:** Changed to `lg` (1024px).
- **Layout:** Fixed `Dashboard.jsx` flex layout with `min-w-0`.

## Verification
1. **Logo:** Refresh `chat.progenicslabs.com`. Logo should be centered, larger (`h-14`), and without tagline.
2. **Sidebar Theme:** Sidebar should be dark with **pure white text**.
3. **Speech:** If speech fails, check the toast message.
4. **NFC:** Tap card -> Enter OTP -> Verify -> Redirect to Chat.
5. **Voice Mode:** Speak a query.
