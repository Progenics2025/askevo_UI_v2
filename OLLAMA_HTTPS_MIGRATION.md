# Ollama HTTPS Migration - Mixed Content Fix

## Problem
The application was experiencing "Mixed Content" errors when served over HTTPS because it was trying to make requests to Ollama over HTTP (localhost:11434). Modern browsers block mixed content (HTTPS page loading HTTP resources) for security reasons.

## Solution
Set up a dedicated HTTPS subdomain for Ollama using Cloudflare Tunnel and updated all frontend code to use the secure endpoint.

## Cloudflare Tunnel Configuration
```yaml
tunnel: ed3d4955-8036-4979-92f4-2c1ac33891c0
credentials-file: /home/progenics-bioinfo/.cloudflared/ed3d4955-8036-4979-92f4-2c1ac33891c0.json

ingress:
  # Backend
  - hostname: chat.progenicslabs.com
    service: http://localhost:3001

  # Ollama
  - hostname: ollama.progenicslabs.com
    service: http://localhost:11434
```

## Code Changes

### 1. Updated `frontend/.env`
Changed Ollama URL from HTTP to HTTPS:
```env
VITE_OLLAMA_URL=https://ollama.progenicslabs.com
```

### 2. Updated `frontend/src/lib/ollamaService.js`
Already had the correct default URL:
```javascript
const OLLAMA_DEFAULT_URL = 'https://ollama.progenicslabs.com';
```

### 3. Updated `frontend/src/GenomicsChat.jsx`
Changed the fallback URL in the Ollama connection check:
```javascript
// Before:
const ollamaUrl = localStorage.getItem('ollamaUrl') || `http://${window.location.hostname}:11434`;

// After:
const ollamaUrl = localStorage.getItem('ollamaUrl') || 'https://ollama.progenicslabs.com';
```

### 4. Updated `frontend/src/SettingsDialog.jsx`
Changed the placeholder text to reflect the new HTTPS URL:
```javascript
placeholder="https://ollama.progenicslabs.com"
```

### 5. Created `frontend/src/lib/migrateOllamaUrl.js`
New migration utility to automatically update existing users' localStorage:
```javascript
export function migrateOllamaUrl() {
    const currentUrl = localStorage.getItem('ollamaUrl');
    
    if (currentUrl && (
        currentUrl.startsWith('http://') || 
        currentUrl.includes(':11434') ||
        currentUrl.includes('localhost')
    )) {
        console.log('Migrating Ollama URL from HTTP to HTTPS...');
        localStorage.setItem('ollamaUrl', 'https://ollama.progenicslabs.com');
        console.log('✅ Ollama URL migrated to HTTPS');
        window.location.reload();
    }
}
```

### 6. Updated `frontend/src/App.jsx`
Added migration call on app startup:
```javascript
import { migrateOllamaUrl } from './lib/migrateOllamaUrl'

useEffect(() => {
    // Migrate Ollama URL from HTTP to HTTPS
    migrateOllamaUrl();
    // ... rest of the code
}, [])
```

## Benefits
✅ **No More Mixed Content Errors**: All requests are now over HTTPS
✅ **Automatic Migration**: Existing users will be automatically migrated to the new URL
✅ **Secure Communication**: All data between frontend and Ollama is encrypted
✅ **Cross-Platform Compatibility**: Works on all browsers and devices (including iOS)
✅ **Production Ready**: Uses proper HTTPS subdomain instead of localhost

## Testing
1. Clear browser cache and localStorage
2. Load the application
3. Check browser console - should see no mixed content errors
4. Verify Ollama connection status shows "Progenics geneLLM" as connected
5. Send a test message to confirm streaming works

## Manual URL Generation (for reference)
If you need to manually set the Ollama URL:
1. Open Settings in the app
2. Under "API Configuration", set Ollama URL to: `https://ollama.progenicslabs.com`
3. Click Save

## Rollback (if needed)
If you need to revert to local development:
1. Open Settings
2. Change Ollama URL to: `http://localhost:11434`
3. Ensure you're accessing the app via HTTP (not HTTPS)
