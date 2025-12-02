# Troubleshooting Guide - Progenics AI

## Common Issues and Solutions

### Installation Issues

#### npm install fails
**Problem**: Dependencies won't install
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Try with legacy peer deps flag
npm install --legacy-peer-deps

# Or use npm 7+ with force flag
npm install --force
```

#### Node version incompatibility
**Problem**: "Node version not supported"

**Solution**:
```bash
# Check your Node version
node --version

# Recommended: Node 16+ or 18+
# Update Node from https://nodejs.org/
```

---

### Ollama Connection Issues

#### "Failed to connect to Ollama server"
**Problem**: Application can't reach Ollama

**Checklist**:
1. Is Ollama running?
   ```bash
   # Check if Ollama process is running
   ps aux | grep ollama
   ```

2. Is Ollama on the correct port?
   ```bash
   # Default port is 11434
   curl http://localhost:11434/api/tags
   ```

3. Is the URL correct in Settings?
   - Default: `http://localhost:11434`
   - Check if you're using a different port

4. Firewall blocking?
   - Check firewall settings
   - Allow localhost connections

**Solution**:
```bash
# Start Ollama if not running
ollama serve

# Or specify a different port
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Verify connection
curl http://localhost:11434/api/tags
```

#### "Model not found" or "Gemma not available"
**Problem**: Ollama doesn't have the Gemma model

**Solution**:
```bash
# Pull the Gemma model
ollama pull gemma

# Verify it's installed
ollama list

# You should see: gemma:latest
```

#### Ollama responds slowly
**Problem**: Responses take a long time

**Causes**:
- First run (model loading)
- Insufficient RAM
- CPU-only mode (no GPU)
- Large model size

**Solutions**:
- Wait for first response (model caching)
- Close other applications
- Use a smaller model: `ollama pull mistral`
- Enable GPU acceleration if available

---

### Genomics API Issues

#### "Failed to connect to API"
**Problem**: Application can't reach genomics API

**Checklist**:
1. Is your API server running?
   ```bash
   # Check if server is running
   curl http://localhost:3001/api/health
   ```

2. Is the URL correct in Settings?
   - Default: `http://localhost:3001/api`
   - Check for typos

3. CORS enabled?
   - API must allow requests from `http://localhost:5173`

**Solution**:
```bash
# Start your API server
node server.js

# Verify it's running
curl http://localhost:3001/api/health

# Should return: { "status": "ok" }
```

#### API returns empty results
**Problem**: Searches return no results

**Causes**:
- No data in database
- Query doesn't match data
- API not returning data correctly

**Solution**:
```bash
# Test API directly
curl "http://localhost:3001/api/variants/search?q=BRCA1"

# Should return variant data
# If empty, populate your database
```

#### CORS errors in browser console
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: Update your API server to enable CORS:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

### Voice Input Issues

#### Microphone not working
**Problem**: Voice input button doesn't respond

**Checklist**:
1. Browser permissions
   - Check if browser has microphone permission
   - Chrome: Settings → Privacy → Microphone
   - Firefox: Preferences → Privacy → Permissions

2. Microphone hardware
   - Is microphone connected?
   - Is microphone muted?
   - Test microphone in system settings

3. Browser support
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Full support

**Solution**:
```javascript
// Check browser support
if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
  console.log('Speech Recognition not supported');
}
```

#### "Permission denied" error
**Problem**: Browser blocks microphone access

**Solution**:
1. Click the lock icon in address bar
2. Find "Microphone" setting
3. Change to "Allow"
4. Reload page

#### Voice input not transcribing
**Problem**: Microphone records but no text appears

**Causes**:
- Microphone not working properly
- Browser not recognizing speech
- Network issue

**Solution**:
```bash
# Test microphone in browser console
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.start();
// Speak into microphone
```

---

### Voice Output Issues

#### Speaker not working
**Problem**: Bot responses don't play audio

**Checklist**:
1. System volume
   - Is system volume muted?
   - Is volume turned up?

2. Browser permissions
   - Does browser have audio permission?

3. Speaker hardware
   - Are speakers connected?
   - Are speakers working?

**Solution**:
```javascript
// Check if speech synthesis is available
if (!window.speechSynthesis) {
  console.log('Speech Synthesis not supported');
}
```

#### Audio plays but no sound
**Problem**: Audio plays but you hear nothing

**Causes**:
- System volume too low
- Browser volume too low
- Audio output device wrong

**Solution**:
1. Check system volume (not muted)
2. Check browser volume
3. Check audio output device in system settings
4. Try different browser

#### Voice output cuts off
**Problem**: Audio stops before message finishes

**Causes**:
- Browser timeout
- Long message
- Browser tab not focused

**Solution**:
- Keep browser tab focused
- Try shorter messages
- Check browser console for errors

---

### Language Issues

#### Language not changing
**Problem**: UI text doesn't update when changing language

**Causes**:
- Cache not cleared
- localStorage issue
- i18n not initialized

**Solution**:
```javascript
// Clear cache and reload
localStorage.clear();
location.reload();

// Or manually set language
localStorage.setItem('language', 'es');
```

#### Voice input/output language not matching
**Problem**: Voice uses wrong language

**Solution**:
1. Go to Settings
2. Select correct language
3. Reload page
4. Try voice input again

#### Missing translations
**Problem**: Some text shows in English even after language change

**Solution**:
- Add missing translations to `src/config/i18n.js`
- Reload page
- Clear browser cache

---

### Performance Issues

#### Application loads slowly
**Problem**: Takes more than 5 seconds to load

**Causes**:
- Large bundle size
- Slow network
- Slow computer

**Solution**:
```bash
# Check bundle size
npm run build

# Optimize if needed
# Remove unused dependencies
npm prune
```

#### Chat responses are slow
**Problem**: Takes more than 10 seconds to get response

**Causes**:
- Ollama processing
- API latency
- Network issues

**Solution**:
- Check Ollama performance
- Check API response time
- Monitor network in DevTools

#### Voice input/output lag
**Problem**: Delay between speaking and transcription

**Causes**:
- Browser processing
- Network latency
- System resources

**Solution**:
- Close other applications
- Use faster internet
- Try different browser

---

### UI/UX Issues

#### Buttons not responding
**Problem**: Clicking buttons does nothing

**Causes**:
- JavaScript error
- Component not loaded
- Event handler issue

**Solution**:
```bash
# Check browser console for errors
# Open DevTools: F12 or Ctrl+Shift+I
# Look for red error messages
```

#### Messages not displaying
**Problem**: Chat messages don't appear

**Causes**:
- Component rendering issue
- State management problem
- CSS hiding messages

**Solution**:
1. Check browser console for errors
2. Verify ChatArea component is loaded
3. Check CSS display properties

#### Settings not saving
**Problem**: Settings reset after page reload

**Causes**:
- localStorage disabled
- Browser privacy mode
- localStorage quota exceeded

**Solution**:
```javascript
// Check localStorage
console.log(localStorage.getItem('language'));

// Clear and reset
localStorage.clear();
```

---

### Browser-Specific Issues

#### Chrome/Edge issues
**Problem**: Features work in Firefox but not Chrome

**Solution**:
- Clear cache: Ctrl+Shift+Delete
- Disable extensions
- Try incognito mode

#### Firefox issues
**Problem**: Features work in Chrome but not Firefox

**Solution**:
- Check about:config settings
- Disable privacy features
- Update Firefox

#### Safari issues
**Problem**: Features work in Chrome but not Safari

**Solution**:
- Update Safari
- Check privacy settings
- Enable JavaScript

---

### Development Issues

#### Hot reload not working
**Problem**: Changes don't reflect when you save files

**Solution**:
```bash
# Restart dev server
npm run dev

# Or check if Vite is running
# Should see: Local: http://localhost:5173
```

#### Build fails
**Problem**: `npm run build` produces errors

**Solution**:
```bash
# Check for syntax errors
npm run lint

# Fix errors
npm run lint -- --fix

# Try building again
npm run build
```

#### Dependencies conflict
**Problem**: Conflicting package versions

**Solution**:
```bash
# Update all packages
npm update

# Or reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Getting Help

#### Check logs
```bash
# Browser console
F12 or Ctrl+Shift+I

# Terminal output
# Check npm run dev output for errors
```

#### Enable debug mode
```javascript
// Add to main.jsx
localStorage.setItem('debug', 'true');

// Check console for debug messages
```

#### Test individual services
```javascript
// Test Ollama
import ollamaService from './services/ollamaService';
ollamaService.checkConnection().then(console.log);

// Test Genomics API
import genomicsApiService from './services/genomicsApiService';
genomicsApiService.checkConnection().then(console.log);

// Test Voice
import voiceService from './services/voiceService';
console.log(voiceService.getAvailableVoices());
```

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Ollama not connecting | `ollama serve` |
| API not connecting | Start your API server |
| Voice not working | Check microphone permissions |
| Language not changing | Clear cache: `localStorage.clear()` |
| Slow responses | Check Ollama/API performance |
| Build fails | `npm install --legacy-peer-deps` |
| Settings not saving | Check localStorage enabled |

---

## Still Having Issues?

1. Check the browser console (F12) for error messages
2. Review the relevant documentation file
3. Verify all prerequisites are installed
4. Try the Quick Start guide again
5. Check GitHub issues or documentation

**Remember**: Most issues are related to Ollama or API server not running!
