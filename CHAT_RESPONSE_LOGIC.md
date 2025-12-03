# Chat Response Logic and Services Documentation

This document explains the architecture, logic, and services used to create chat responses in the Progenics AI Genomics Assistant.

## Overview

The chat system uses a **context-aware streaming architecture** that combines:
1. **Genomics data retrieval** from external APIs
2. **Ollama LLM** for generating intelligent responses
3. **Multi-language support** for global accessibility
4. **Real-time streaming** for ChatGPT-like experience

---

## Architecture Flow

```
User Input → Context Building → LLM Processing → Streaming Response → Save to DB
     ↓              ↓                   ↓                ↓              ↓
ChatArea.jsx  genomicsApiService  ollamaService   Real-time UI   chatService
                                                    updates
```

---

## Core Services

### 1. **ollamaService.js** - LLM Response Generation

**Location**: `/src/services/ollamaService.js`

**Purpose**: Communicates with the Ollama server to generate AI responses using local LLM models.

#### Key Functions:

##### `generateStreamResponse(prompt, context, language, onChunk, abortSignal)`

This is the **primary function** for chat responses. It:

```javascript
// Builds the full prompt with language instruction and context
const languageInstruction = `Please respond in ${languageName}. `;
const fullPrompt = context
  ? `${languageInstruction}Context: ${context}\n\nQuestion: ${prompt}`
  : `${languageInstruction}${prompt}`;

// Sends streaming request to Ollama
const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL_NAME,        // Default: 'gemma3n:latest'
    prompt: fullPrompt,
    stream: true,             // Enable streaming
    temperature: 0.7,         // Creativity level
  }),
  signal: abortSignal        // For stop functionality
});
```

**Stream Processing**:
- Uses `ReadableStream` to process chunks in real-time
- Each chunk is decoded and parsed as JSON
- `onChunk` callback updates UI immediately
- Supports abortion via `AbortController`

**Parameters**:
- `prompt`: User's question/message
- `context`: Genomics data context (built separately)
- `language`: ISO language code (en, es, hi, te, etc.)
- `onChunk`: Callback function for each response chunk
- `abortSignal`: Signal to stop generation

**Supported Languages**:
English, Spanish, French, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Arabic, Odia

---

### 2. **genomicsApiService.js** - Context Data Retrieval

**Location**: `/src/services/genomicsApiService.js`

**Purpose**: Fetches relevant genomics data to provide context for the LLM.

#### API Endpoints:

```javascript
// Variant Information
searchVariants(query)         // GET /variants/search?q=query
getVariant(variantId)         // GET /variants/{variantId}

// Disease Information
searchDiseases(query)         // GET /diseases/search?q=query
getDisease(diseaseId)         // GET /diseases/{diseaseId}

// Diagnostic Tests
searchTests(query)            // GET /tests/search?q=query
getTest(testId)              // GET /tests/{testId}

// Associations
getVariantDiseaseAssociation(variantId)  // GET /associations/variant/{variantId}
getDiseaseTests(diseaseId)               // GET /diseases/{diseaseId}/tests
```

**Base URL**: Configured via `VITE_GENOMICS_API_URL` or defaults to `http://[hostname]:3001/api`

---

### 3. **chatService.js** - Message Persistence

**Location**: `/src/services/chatService.js`

**Purpose**: Manages chat sessions and message storage in the backend database.

#### Key Functions:

```javascript
// Session Management
createSession(title, language)           // POST /chat/sessions
getSessions()                            // GET /chat/sessions
getSessionMessages(sessionId)            // GET /chat/sessions/{id}/messages
archiveSession(sessionId)                // PUT /chat/sessions/{id}/archive

// Message Management
saveMessage(sessionId, messageText, senderType, ...)  // POST /chat/messages
updateMessageFeedback(messageId, liked, disliked, ...) // PUT /chat/messages/{id}/feedback

// File Management
uploadFile(file, sessionId, description)  // POST /upload
```

**Authentication**: Uses JWT tokens via interceptors
- Automatically adds `Authorization: Bearer {token}` header
- Handles 401 errors by dispatching `auth:unauthorized` event

---

## Context Building Logic

**Location**: `ChatArea.jsx → buildContext()`

This function enriches user queries with relevant genomics data:

```javascript
const buildContext = async (userMessage) => {
  let context = '';
  
  // 1. Detect query type using regex
  const variantMatch = userMessage.match(/variant|mutation|SNP/i);
  const diseaseMatch = userMessage.match(/disease|disorder|condition/i);
  const testMatch = userMessage.match(/test|screening|diagnosis/i);
  
  // 2. Fetch relevant data based on detection
  if (variantMatch) {
    const variants = await genomicsApiService.searchVariants(userMessage);
    if (variants?.length > 0) {
      context += `Relevant Variants: ${JSON.stringify(variants.slice(0, 2))}\n`;
    }
  }
  
  if (diseaseMatch) {
    const diseases = await genomicsApiService.searchDiseases(userMessage);
    if (diseases?.length > 0) {
      context += `Relevant Diseases: ${JSON.stringify(diseases.slice(0, 2))}\n`;
    }
  }
  
  if (testMatch) {
    const tests = await genomicsApiService.searchTests(userMessage);
    if (tests?.length > 0) {
      context += `Relevant Tests: ${JSON.stringify(tests.slice(0, 2))}\n`;
    }
  }
  
  return context;
};
```

**Pattern Detection**:
- Variant-related: `variant`, `mutation`, `SNP`
- Disease-related: `disease`, `disorder`, `condition`
- Test-related: `test`, `screening`, `diagnosis`

**Context Format**:
The context is formatted as a string and prepended to the LLM prompt:
```
Context: Relevant Variants: [{"id": "rs123", "gene": "BRCA1", ...}]
Relevant Diseases: [{"id": "D001", "name": "Breast Cancer", ...}]

Question: What are the risks of BRCA1 mutations?
```

---

## Complete Chat Flow

**Location**: `ChatArea.jsx → handleSend()`

### Step-by-Step Execution:

#### 1. **User Input Validation**
```javascript
if (!inputValue.trim() || isLoading) return;
const userMessage = inputValue.trim();
```

#### 2. **Create User Message**
```javascript
const newUserMsg = {
  id: Date.now(),
  text: userMessage,
  sender: 'user',
  timestamp: new Date()
};
setMessages(prev => [...prev, newUserMsg]);
```

#### 3. **Session Management**
```javascript
let sessionId = currentSessionId;
if (!sessionId) {
  // First message - create new session
  const sessionResponse = await chatService.createSession(
    userMessage.substring(0, 50),  // Use first 50 chars as title
    i18n.language
  );
  sessionId = sessionResponse.session_id;
  setCurrentSessionId(sessionId);
  onSessionCreated(sessionId);  // Notify parent to refresh sidebar
}
```

#### 4. **Save User Message to Database**
```javascript
await chatService.saveMessage(
  parseInt(sessionId, 10),
  userMessage,
  'user',
  'text'
);
```

#### 5. **Build Genomics Context**
```javascript
const context = await buildContext(userMessage);
// Returns string with relevant variants, diseases, tests
```

#### 6. **Create Bot Message Placeholder**
```javascript
const botMsgId = Date.now() + 1;
const botMsg = {
  id: botMsgId,
  text: '',  // Empty initially
  sender: 'bot',
  timestamp: new Date()
};
setMessages(prev => [...prev, botMsg]);
```

#### 7. **Stream Response from Ollama**
```javascript
let fullResponse = '';
const abortController = new AbortController();
setAbortController(abortController);

await ollamaService.generateStreamResponse(
  userMessage,
  context,
  i18n.language,
  (chunk) => {
    // Called for each streaming chunk
    fullResponse += chunk;
    setMessages(prev => prev.map(msg =>
      msg.id === botMsgId
        ? { ...msg, text: fullResponse }  // Update bot message in real-time
        : msg
    ));
  },
  abortController.signal
);
```

#### 8. **Save Bot Response to Database**
```javascript
await chatService.saveMessage(
  parseInt(sessionId, 10),
  fullResponse,
  'bot',
  'text'
);
```

#### 9. **Auto-Speak (Optional)**
```javascript
const autoSpeak = localStorage.getItem('autoSpeak') === 'true';
if (autoSpeak) {
  voiceService.speak(fullResponse, langMap[i18n.language] || 'en-US');
}
```

#### 10. **Error Handling**
```javascript
catch (error) {
  if (error.name === 'AbortError') {
    // User stopped generation
    setMessages(prev => prev.map(msg =>
      msg.id === botMsgId
        ? { ...msg, text: fullResponse + ' [Stopped]' }
        : msg
    ));
  } else {
    // Other errors
    const errorMsg = {
      text: `Error: ${error.message}. Please try again.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMsg]);
  }
}
```

---

## Configuration

### Environment Variables

**Frontend** (`.env`):
```bash
# Ollama LLM Server
VITE_OLLAMA_URL=/ollama                    # Proxied to localhost:11434
VITE_OLLAMA_MODEL=gemma3n:latest           # LLM model name

# Backend API
VITE_API_URL=http://localhost:3001/api     # Chat sessions/messages

# Genomics API
VITE_GENOMICS_API_URL=http://localhost:3001/api  # Genomics data
```

**Vite Proxy** (`vite.config.js`):
```javascript
proxy: {
  '/ollama': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/ollama/, '')
  }
}
```

---

## Database Schema

### Sessions Table
```sql
CREATE TABLE chat_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  session_title VARCHAR(255),
  language VARCHAR(10),
  created_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT 0
);
```

### Messages Table
```sql
CREATE TABLE chat_messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  message_text TEXT,
  sender_type ENUM('user', 'bot'),
  message_type ENUM('text', 'voice', 'file'),
  voice_url VARCHAR(500),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  liked BOOLEAN,
  disliked BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMP
);
```

---

## Key Features

### 1. **Real-Time Streaming**
- Uses `fetch` with `ReadableStream` for progressive rendering
- Updates UI after each chunk (ChatGPT-like experience)
- Non-blocking architecture for high concurrency

### 2. **Context-Aware Responses**
- Automatically enriches queries with genomics data
- Searches variants, diseases, and tests based on keywords
- Passes context to LLM for accurate, domain-specific answers

### 3. **Multi-Language Support**
- 11 languages supported (English, Hindi, Telugu, Tamil, etc.)
- Language instruction prepended to every prompt
- UI and responses both localized

### 4. **Stop Generation**
- Uses `AbortController` to cancel ongoing requests
- Gracefully handles partial responses
- Marks stopped messages with `[Stopped]` tag

### 5. **Session Management**
- Automatic session creation on first message
- Persistent conversations in database
- Archive instead of delete (soft delete)

### 6. **Voice Integration** (Optional)
- Auto-speak bot responses
- Multi-language TTS support
- Configurable via localStorage

---

## Error Handling

### Connection Failures
```javascript
if (!ollamaConnected) {
  // Display error message
  const errorMsg = {
    text: 'Ollama server is not connected. Please ensure Ollama is running on http://localhost:11434',
    sender: 'bot',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, errorMsg]);
}
```

### API Timeouts
- Default timeout: 60 seconds (Ollama)
- Default timeout: 10 seconds (Chat/Genomics APIs)
- Graceful degradation if genomics API fails (context will be empty)

### Authentication Errors
- 401 responses trigger `auth:unauthorized` event
- User redirected to login page
- Token automatically attached via interceptors

---

## Performance Optimizations

1. **Lazy Context Building**: Only fetches genomics data if keywords detected
2. **Limited Results**: Takes only first 2 results from each search
3. **Streaming**: Prevents blocking UI during long responses
4. **Debouncing**: Input changes don't trigger API calls until send
5. **AbortController**: Allows stopping expensive LLM operations

---

## Testing the Flow

### 1. Start Ollama
```bash
ollama serve
# Should run on http://localhost:11434
```

### 2. Start Backend
```bash
cd backend
npm run dev
# Should run on http://localhost:3001
```

### 3. Start Frontend
```bash
npm run dev
# Should run on http://localhost:5173
```

### 4. Test Query
```
User: "What are BRCA1 variants?"

System Flow:
1. Detects "variant" keyword
2. Calls genomicsApiService.searchVariants("What are BRCA1 variants?")
3. Builds context: "Relevant Variants: [...]"
4. Sends to Ollama: "Please respond in English. Context: [...]\n\nQuestion: What are BRCA1 variants?"
5. Streams response chunk by chunk
6. Saves to database
7. Auto-speaks if enabled
```

---

## Future Enhancements

1. **Conversation History**: Pass previous messages for better context
2. **File Analysis**: Parse uploaded genomics files (VCF, BAM) for context
3. **RAG (Retrieval Augmented Generation)**: Embed and search documents
4. **Fine-tuned Models**: Custom genomics-trained LLMs
5. **Multi-turn Context**: Remember previous queries in session

---

## Troubleshooting

### Issue: Streaming not working (403 error)
**Solution**: Ensure `abortSignal` parameter is passed correctly to `generateStreamResponse()`

### Issue: Context is empty
**Solution**: Check genomics API is running and endpoints are responding

### Issue: Messages not saving
**Solution**: Verify JWT token is valid and session_id is an integer

### Issue: Wrong language responses
**Solution**: Check `i18n.language` value and language map in ollamaService

---

## Summary

The chat response system uses a **three-tier architecture**:

1. **Frontend (ChatArea.jsx)**: Orchestrates the flow, manages UI state
2. **Context Layer (genomicsApiService)**: Enriches queries with domain data
3. **LLM Layer (ollamaService)**: Generates intelligent, streaming responses

All messages are persisted via **chatService** for session continuity, and the entire flow supports **real-time streaming**, **multi-language**, and **stop functionality** for production-grade chat experience.
