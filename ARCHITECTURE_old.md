# Architecture - Progenics AI

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Progenics AI Application                     │
│                    (React + Vite Frontend)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Ollama     │ │  Genomics    │ │   Browser    │
        │   Server     │ │   API        │ │   APIs       │
        │ (Gemma LLM)  │ │  (Backend)   │ │ (Web Speech) │
        └──────────────┘ └──────────────┘ └──────────────┘
```

## Component Architecture

```
App.jsx
  └── ChatPage.jsx
      ├── Sidebar.jsx
      │   ├── LanguageSelector.jsx
      │   └── Settings.jsx
      │       └── LanguageSelector.jsx
      └── ChatArea.jsx
          ├── MessageBubble.jsx (multiple)
          └── Input Form
              ├── Text Input
              ├── Microphone Button
              └── Send Button
```

## Data Flow Architecture

```
User Input
    │
    ├─ Text Input
    │   └─ ChatArea.jsx
    │
    └─ Voice Input
        └─ voiceService.js (Web Speech API)
            └─ ChatArea.jsx

ChatArea.jsx
    │
    ├─ Build Context
    │   └─ genomicsApiService.js
    │       ├─ searchVariants()
    │       ├─ searchDiseases()
    │       └─ searchTests()
    │
    ├─ Generate Response
    │   └─ ollamaService.js
    │       └─ generateResponse(prompt, context)
    │
    ├─ Display Message
    │   └─ MessageBubble.jsx
    │
    └─ Optional: Speak Response
        └─ voiceService.js (Text-to-Speech)
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  ollamaService   │ │genomicsApiService│ │  voiceService    │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ generateResponse │ │ searchVariants   │ │ startListening   │
│ checkConnection  │ │ searchDiseases   │ │ stopListening    │
│                  │ │ searchTests      │ │ speak            │
│                  │ │ getVariant       │ │ stopSpeaking     │
│                  │ │ getDisease       │ │ isSpeaking       │
│                  │ │ getTest          │ │ getAvailableVoices
│                  │ │ checkConnection  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Ollama API      │ │ Genomics API     │ │ Web Speech API   │
│ localhost:11434  │ │ localhost:3001   │ │ (Browser)        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## State Management Architecture

```
ChatArea Component
├── messages (useState)
│   └── Array of message objects
│       ├── id
│       ├── text
│       ├── sender (user/bot)
│       └── timestamp
│
├── inputValue (useState)
│   └── Current input text
│
├── isLoading (useState)
│   └── Loading state during API calls
│
├── isListening (useState)
│   └── Voice input active state
│
├── isSpeaking (useState)
│   └── Voice output active state
│
└── recognitionRef (useRef)
    └── Speech Recognition instance

localStorage
├── language
├── autoSpeak
├── ollamaUrl
└── genomicsApiUrl
```

## API Integration Architecture

### Ollama Integration
```
ChatArea.jsx
    │
    └─ ollamaService.generateResponse()
        │
        ├─ Build prompt with context
        │
        └─ POST /api/generate
            ├─ model: "gemma"
            ├─ prompt: "..."
            ├─ stream: false
            └─ temperature: 0.7
            
            Response: { response: "..." }
```

### Genomics API Integration
```
ChatArea.jsx
    │
    └─ buildContext()
        │
        ├─ genomicsApiService.searchVariants()
        │   └─ GET /api/variants/search?q=query
        │
        ├─ genomicsApiService.searchDiseases()
        │   └─ GET /api/diseases/search?q=query
        │
        └─ genomicsApiService.searchTests()
            └─ GET /api/tests/search?q=query
            
            Response: { variants/diseases/tests: [...] }
```

### Voice API Integration
```
ChatArea.jsx
    │
    ├─ voiceService.startListening()
    │   └─ SpeechRecognition API
    │       └─ onresult: transcript
    │
    └─ voiceService.speak()
        └─ SpeechSynthesis API
            └─ utterance.speak()
```

## Configuration Architecture

```
Environment Variables (.env)
├── REACT_APP_OLLAMA_URL
├── REACT_APP_OLLAMA_MODEL
├── REACT_APP_GENOMICS_API_URL
└── REACT_APP_DEFAULT_LANGUAGE

localStorage
├── language
├── autoSpeak
├── ollamaUrl
└── genomicsApiUrl

i18n Configuration (i18n.js)
├── en (English)
├── es (Spanish)
└── fr (French)
```

## Request/Response Flow

### Chat Message Flow
```
1. User sends message
   ↓
2. ChatArea receives input
   ↓
3. Add user message to state
   ↓
4. Build context from Genomics API
   ├─ Search variants
   ├─ Search diseases
   └─ Search tests
   ↓
5. Send to Ollama with context
   ├─ POST /api/generate
   └─ Receive response
   ↓
6. Add bot message to state
   ↓
7. Display in MessageBubble
   ↓
8. Optional: Speak response
```

### Voice Input Flow
```
1. User clicks microphone button
   ↓
2. Browser requests microphone permission
   ↓
3. SpeechRecognition starts listening
   ↓
4. User speaks
   ↓
5. Browser transcribes speech
   ↓
6. Transcript added to input field
   ↓
7. User can edit or send
```

### Voice Output Flow
```
1. User clicks speaker icon
   ↓
2. Get message text
   ↓
3. Get current language
   ↓
4. SpeechSynthesis speaks text
   ↓
5. Audio plays through speakers
   ↓
6. User can stop at any time
```

## Error Handling Architecture

```
Try-Catch Blocks
├── ollamaService
│   └─ Catch: "Failed to generate response"
│
├── genomicsApiService
│   └─ Catch: "Failed to fetch genomics data"
│
└── voiceService
    └─ Catch: "Voice feature not supported"

Error Display
└─ MessageBubble with error text
```

## Performance Architecture

```
Optimization Strategies
├── Component Memoization
│   └─ React.memo for MessageBubble
│
├── Lazy Loading
│   └─ Settings modal loads on demand
│
├── Efficient Re-rendering
│   └─ useCallback for event handlers
│
├── API Caching
│   └─ localStorage for settings
│
└── CSS Optimization
    └─ Minimal animations
    └─ Hardware acceleration
```

## Security Architecture

```
Security Measures
├── Input Validation
│   └─ Trim and validate user input
│
├── CORS Handling
│   └─ API requests with proper headers
│
├── No Sensitive Data
│   └─ localStorage only for preferences
│
└── Error Handling
    └─ Don't expose sensitive error details
```

## Deployment Architecture

```
Development
├── npm run dev
└─ Vite dev server (localhost:5173)

Production
├── npm run build
├─ Vite build process
└─ dist/ folder
    ├─ index.html
    ├─ assets/
    │   ├─ js/
    │   └─ css/
    └─ Deploy to hosting service
```

## Browser API Usage

```
Web APIs Used
├── Web Speech API
│   ├─ SpeechRecognition (input)
│   └─ SpeechSynthesis (output)
│
├── localStorage API
│   └─ Persist settings
│
├── Fetch/Axios API
│   └─ HTTP requests
│
└── DOM APIs
    └─ DOM manipulation
```

## Technology Stack

```
Frontend
├── React 19
├── Vite (build tool)
├── React Router (navigation)
├── i18next (internationalization)
├── Axios (HTTP client)
└── Lucide React (icons)

Backend Services
├── Ollama (LLM)
├── Genomics API (custom)
└── Browser APIs (Web Speech)

Styling
├── CSS3
├── Glassmorphism effects
└── Responsive design
```

## Scalability Considerations

```
Current Architecture
├── Single user
├── In-memory chat history
└── No database

Future Scalability
├── Add authentication
├── Add database for chat history
├── Add user profiles
├── Add multi-user support
├── Add real-time collaboration
└── Add advanced analytics
```

## Integration Points

```
External Systems
├── Ollama Server
│   └─ http://localhost:11434
│
├── Genomics API
│   └─ http://localhost:3001/api
│
└── Browser APIs
    ├─ Web Speech API
    ├─ localStorage
    └─ Fetch API
```

---

This architecture provides a scalable, maintainable foundation for the Progenics AI genomics chat application.
