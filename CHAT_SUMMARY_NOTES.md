## Chat Session Summary/Title Auto-Generation

### Issue:
Sessions are created with "New Chat" but don't automatically get meaningful titles based on conversation content.

### Solution:
Auto-generate session title from first user message (first 50 characters).

### Implementation:

**Option 1: Frontend Auto-Title (Quick)**
When sending the first message, update session title:
```javascript
// In GenomicsChat.jsx handleSend
if (messages.length <= 1) { // Only bot welcome message
  const title = userPrompt.substring(0, 50) + (userPrompt.length > 50 ? '...' : '');
  await apiService.renameSession(chatId, title);
}
```

**Option 2: Backend Auto-Title (Better)**
Modify backend to auto-set title on first message:
```javascript
// In backend/routes/chat.js - POST /messages
const [messages] = await pool.query('SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?', [session_id]);
if (messages[0].count === 0 && sender_type === 'user') {
  const title = message_text.substring(0, 50) + (message_text.length > 50 ? '...' : '');
  await pool.query('UPDATE chat_sessions SET session_title = ? WHERE id = ?', [title, session_id]);
}
```

**Option 3: AI-Generated Summary (Best - requires Ollama)**
Use Ollama to generate concise title:
```javascript
const summary = await ollama.generate({
  model: 'gemma3:4b',
  prompt: `Generate a very short 3-5 word title for this conversation: "${message_text}"`,
  stream: false
});
```

### Current Status:
- ✅ Rename/Delete work
- ⚠️ Sessions still show "New Chat" until manually renamed
- Recommended: Implement Option 1 (quick) or Option 2 (better)
