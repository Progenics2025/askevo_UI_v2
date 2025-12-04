# NFC Login Testing Guide

## Quick Test Steps

### For Existing Registered Users

1. **Tap NFC Chip**
   - Scan your NFC card with your phone
   - You should be redirected to: `https://your-domain.com/nfc-login?token=YOUR_TOKEN`

2. **Verify OTP Screen**
   - ✅ You should see "Security Check" screen
   - ✅ Message should say "Enter the code sent to [your masked email]"
   - ✅ Check your email for the 6-digit OTP code

3. **Enter OTP**
   - Enter the 6-digit code from your email
   - Click "Verify Login"

4. **Expected Result** ✅
   - ✅ Toast message: "Welcome back, [Your Name]!"
   - ✅ Page reloads and redirects to chat page (Dashboard)
   - ✅ You should see the GenomicsChat interface
   - ✅ Sidebar should show your chat history
   - ❌ You should NOT be redirected to the login page

### For New Users (First Time NFC Registration)

1. **Tap NFC Chip**
   - Scan a new, unregistered NFC card
   - You should be redirected to: `https://your-domain.com/nfc-login?token=NEW_TOKEN`

2. **Verify Registration Screen**
   - ✅ You should see "New Card Detected" screen
   - ✅ Message should say "Create an account to link this card"
   - ✅ Form fields for: Full Name, Email, Phone Number

3. **Fill Registration Form**
   - Enter your full name
   - Enter your email address
   - Enter your phone number
   - Click "Create Account"

4. **Expected Result** ✅
   - ✅ Toast message: "Account created successfully!"
   - ✅ Toast message: "Password sent to your email."
   - ✅ Page reloads and redirects to chat page (Dashboard)
   - ✅ You should see the GenomicsChat interface
   - ✅ Check your email for your auto-generated password
   - ❌ You should NOT be redirected to the login page

## What Was Fixed

### Before Fix ❌
```
NFC Tap → OTP Verification → Welcome Message → Login Page (WRONG!)
```

### After Fix ✅
```
NFC Tap → OTP Verification → Welcome Message → Chat Page (CORRECT!)
```

## Technical Details

The fix ensures that after successful NFC authentication:
1. User credentials are saved to localStorage
2. Page performs a full reload (`window.location.href = '/'`)
3. App.jsx re-initializes and detects authenticated user
4. User is automatically redirected to /dashboard (chat page)

## Troubleshooting

### If you still see the login page:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for any errors in the Console tab
   - Check Network tab for failed API calls

2. **Verify localStorage**
   - In Console, run: `localStorage.getItem('user')`
   - Should show user data JSON
   - In Console, run: `localStorage.getItem('token')`
   - Should show JWT token

3. **Clear Cache and Try Again**
   - Clear browser cache
   - Clear localStorage: `localStorage.clear()`
   - Try the NFC login flow again

4. **Check Backend Logs**
   - Verify OTP was sent successfully
   - Check for any authentication errors

## Test Checklist

- [ ] Existing user can tap NFC and login successfully
- [ ] OTP is received via email
- [ ] OTP verification works correctly
- [ ] Welcome message appears
- [ ] User lands on chat page (not login page)
- [ ] New user can register via NFC
- [ ] Registration email with password is sent
- [ ] New user lands on chat page after registration
- [ ] Chat functionality works after NFC login
- [ ] User session persists after page refresh

## Files Modified

- `/frontend/src/NFCLogin.jsx` - Lines 108-113, 132-138

## Related Documentation

- See `NFC_LOGIN_FIX.md` for detailed technical explanation
- See `backend/routes/auth.js` for NFC authentication endpoints
