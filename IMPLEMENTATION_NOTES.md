# Session Persistence Implementation

## Current Status
- ✅ Ollama streaming integration working
- ✅ Markdown rendering with Response component  
- ✅ Dashboard loads sessions from database
- ✅ Text colors fixed in Response component
- ⚠️ Messages NOT being saved to database
- ⚠️ No context/memory between messages
- ⚠️ Chat history loads but needs proper authentication

## Required Implementation

### 1. GenomicsChat.jsx Changes

#### Add Imports (line 12-14)
```javascript
import { ttsService } from './lib/tts';
import { ollamaService } from './lib/ollamaService';
import { Response } from './components/ui/response';
import { apiService } from './lib/apiService';
```

#### Add State (line 35)
```javascript
const [isLoadingMessages, setIsLoadingMessages] = useState(false);
```

#### Add Message Loading Effect (after line 47)
```javascript
// Load messages when chat session changes
useEffect(() => {
  const loadSessionMessages = async () => {
    if (!chatId) return;
    
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      
      if (chatId.startsWith('default-')) {
        // Local session - show welcome
        setMessages([{
          id: '1',
          type: 'bot',
          content: t('welcome') + "! " + t('inputPlaceholder'),
          timestamp: new Date(),
        }]);
      } else if (token) {
        // Load from database
        const sessionMessages = await apiService.getSessionMessages(chatId);
        
        if (sessionMessages.length > 0) {
          const formatted = sessionMessages.map(msg => ({
            id: msg.message_id.toString(),
            type: msg.role === 'user' ? 'user' : 'bot',
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formatted);
        } else {
          // Empty session
          setMessages([{
            id: '1',
            type: 'bot',
            content: t('welcome') + "! " + t('inputPlaceholder'),
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([{
        id: '1',
        type: 'bot',
        content: t('welcome') + "! " + t('inputPlaceholder'),
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  loadSessionMessages();
}, [chatId, t]);
```

#### Update handleSend Function (replace lines 113-145)
```javascript
const handleSend = async () => {
  if (!inputValue.trim()) return;

  const userMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: inputValue,
    timestamp: new Date(),
  };

  // Optimistic update
  setMessages((prev) => [...prev, userMessage]);
  const userPrompt = inputValue;
  setInputValue('');

  // Save user message to database (non-blocking)
  const saveUserMsg = (async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && !chatId.startsWith('default-')) {
        await apiService.saveMessage(chatId, 'user', userPrompt);
      }
    } catch (error) {
      console.error('Failed to save user message:', error);
    }
  })();

  // Create bot placeholder
  const botMessageId = (Date.now() + 1).toString();
  const botMessage = {
    id: botMessageId,
    type: 'bot',
    content: '',
    timestamp: new Date(),
    streaming: true
  };
  
  setMessages((prev) => [...prev, botMessage]);

  try {
    // Build context from last 10 messages
    const contextMsgs = messages
      .slice(-10)
      .filter(m => !m.streaming && m.content)
      .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const promptWithContext = contextMsgs 
      ? `Previous conversation:\n${contextMsgs}\n\nUser: ${userPrompt}\nAssistant:` 
      : userPrompt;

    // Stream response from Ollama
    let fullResponse = '';
    
    for await (const chunk of ollamaService.streamResponse(promptWithContext, [], null)) {
      fullResponse += chunk;
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: fullResponse, streaming: true }
            : msg
        )
      );
    }

    // Mark complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === botMessageId
          ? { ...msg, streaming: false }
          : msg
      )
    );

    // Save bot response to database
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && !chatId.startsWith('default-')) {
          await saveUserMsg; // Wait for user message first
          await apiService.saveMessage(chatId, 'assistant', fullResponse);
        }
      } catch (error) {
        console.error('Failed to save bot response:', error);
      }
    })();

    // Auto-speak if enabled
    if (localStorage.getItem('autoSpeak') === 'true' && fullResponse) {
      ttsService.speak(fullResponse, i18n.language);
    }

  } catch (error) {
    console.error('Ollama error:', error);
    
    const errorMessage = 'Sorry, I encountered an error connecting to the AI model. Please check if Ollama is running.';
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === botMessageId
          ? { ...msg, content: errorMessage, streaming: false, error: true }
          : msg
      )
    );
    
    toast.error('Failed to get AI response');
  }
};
```

### 2. Authentication Setup

To enable database session storage, user needs to login. Currently using mock login.

**Option A: Quick Fix - Create Default User**
```sql
INSERT INTO users (username, email, password_hash) 
VALUES ('demo', 'demo@genomics.local', '$2a$10$...');
```

**Option B: Update LoginPage.jsx to use real backend**
```javascript
const handleLogin = async () => {
  const data = await apiService.login(email, password);
  // Token is automatically saved
};
```

### 3. Testing Checklist

- [ ] Messages load when switching sessions
- [ ] New messages save to database
- [ ] Context builds from previous messages  
- [ ] Ollama responses maintain conversation context
- [ ] File uploads link to session
- [ ] Chat history shows all sessions
- [ ] No jitter during streaming
- [ ] Markdown renders properly

## Files Modified
1. `frontend/src/GenomicsChat.jsx` - Session management, message persistence, context
2. `frontend/src/Dashboard.jsx` - Session loading (DONE ✅)
3. `frontend/src/components/ui/response.jsx` - Text colors (DONE ✅)
4. `frontend/src/lib/apiService.js` - Backend communication (EXISTS ✅)
5. `frontend/src/lib/ollamaService.js` - LLM streaming (EXISTS ✅)
