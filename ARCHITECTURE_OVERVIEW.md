# 🏗️ PROGENICS AI - ARCHITECTURE OVERVIEW

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                    (http://localhost:5173)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    REACT FRONTEND                            │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │              App.jsx (Router)                       │   │  │
│  │  │  ┌──────────────────────────────────────────────┐  │   │  │
│  │  │  │ AuthProvider (Global Auth State)             │  │   │  │
│  │  │  │                                              │  │   │  │
│  │  │  │  ┌─────────────────────────────────────┐    │  │   │  │
│  │  │  │  │ /login → LoginPage                  │    │  │   │  │
│  │  │  │  │ /chat → ProtectedRoute → ChatPage   │    │  │   │  │
│  │  │  │  │                                     │    │  │   │  │
│  │  │  │  │ ChatPage                            │    │  │   │  │
│  │  │  │  │ ├─ Sidebar (with logout)            │    │  │   │  │
│  │  │  │  │ └─ ChatArea                         │    │  │   │  │
│  │  │  │  │    ├─ MessageBubble                 │    │  │   │  │
│  │  │  │  │    └─ Input Form                    │    │  │   │  │
│  │  │  │  └─────────────────────────────────────┘    │  │   │  │
│  │  │  └──────────────────────────────────────────────┘  │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  Services Layer:                                            │  │
│  │  ├─ authService.js (Authentication)                        │  │
│  │  ├─ chatService.js (Chat API calls)                        │  │
│  │  ├─ ollamaService.js (AI Model)                            │  │
│  │  ├─ genomicsApiService.js (Genomics Data)                  │  │
│  │  └─ voiceService.js (Speech I/O)                           │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    HTTP/REST API │ (Port 3001)
                                 │
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                               │
│                  (http://localhost:3001)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    server.js                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │ Middleware:                                          │   │  │
│  │  │ ├─ CORS (Cross-Origin Resource Sharing)             │   │  │
│  │  │ ├─ Helmet (Security)                                │   │  │
│  │  │ ├─ Morgan (Logging)                                 │   │  │
│  │  │ └─ Express JSON Parser                              │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  Routes:                                                    │  │
│  │  ├─ /api/auth (Authentication)                             │  │
│  │  │  ├─ POST /register                                      │  │
│  │  │  ├─ POST /login                                         │  │
│  │  │  └─ POST /logout                                        │  │
│  │  │                                                          │  │
│  │  ├─ /api/chat (Chat Management)                            │  │
│  │  │  ├─ POST /sessions (Create session)                     │  │
│  │  │  ├─ GET /sessions (Get user sessions)                   │  │
│  │  │  ├─ GET /sessions/:id/messages (Get messages)           │  │
│  │  │  ├─ POST /messages (Save message)                       │  │
│  │  │  └─ PUT /messages/:id/feedback (Save feedback)          │  │
│  │  │                                                          │  │
│  │  └─ /api/files (File Management)                           │  │
│  │     ├─ POST /upload (Upload file)                          │  │
│  │     ├─ GET /files (Get user files)                         │  │
│  │     ├─ GET /files/:id/download (Download file)             │  │
│  │     └─ DELETE /files/:id (Delete file)                     │  │
│  │                                                              │  │
│  │  Middleware:                                                │  │
│  │  └─ authenticateToken (JWT verification)                   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    MySQL Driver │ (Port 3306)
                                 │
┌─────────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                                 │
│                  (localhost:3306)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Database: progenics_ai                                            │
│                                                                     │
│  Tables:                                                            │
│  ├─ users (User accounts)                                          │
│  ├─ user_preferences (User settings)                               │
│  ├─ session_tokens (JWT tokens)                                    │
│  ├─ chat_sessions (Chat conversations)                             │
│  ├─ chat_messages (Messages in chats)                              │
│  ├─ file_uploads (Uploaded files)                                  │
│  ├─ genomics_variants (Genetic variants)                           │
│  ├─ genomics_diseases (Disease data)                               │
│  ├─ genomics_tests (Genetic tests)                                 │
│  ├─ genomics_genes (Gene information)                              │
│  ├─ genomics_pathways (Biological pathways)                        │
│  └─ genomics_literature (Research papers)                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    HTTP Request │ (Port 11434)
                                 │
┌─────────────────────────────────────────────────────────────────────┐
│                      OLLAMA AI SERVER                               │
│                  (localhost:11434)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Model: gemma (or other LLM)                                       │
│                                                                     │
│  Endpoints:                                                         │
│  ├─ /api/generate (Generate text)                                  │
│  ├─ /api/tags (List available models)                              │
│  └─ /api/pull (Download model)                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Authentication Flow
```
User Input (Email/Password)
    ↓
LoginPage.jsx
    ↓
authService.login()
    ↓
POST /api/auth/login
    ↓
Backend: Verify credentials
    ↓
Generate JWT Token
    ↓
Save to localStorage
    ↓
AuthContext updates
    ↓
Redirect to /chat
```

### Chat Message Flow
```
User Types Message
    ↓
ChatArea.jsx
    ↓
handleSend()
    ↓
Save to local state
    ↓
chatService.saveMessage() → POST /api/chat/messages
    ↓
Backend saves to database
    ↓
ollamaService.generateResponse()
    ↓
POST http://localhost:11434/api/generate
    ↓
Ollama returns response
    ↓
chatService.saveMessage() → Save bot response
    ↓
Update UI with bot message
    ↓
Auto-speak (if enabled)
```

### Session Creation Flow
```
User logs in
    ↓
ChatPage mounts
    ↓
ChatArea useEffect
    ↓
chatService.createSession()
    ↓
POST /api/chat/sessions
    ↓
Backend creates session
    ↓
Returns session_id
    ↓
Store in state
    ↓
Ready for messages
```

---

## Component Hierarchy

```
App
├── AuthProvider
│   └── Router
│       ├── Route: /login
│       │   └── LoginPage
│       │       ├── LoginForm
│       │       └── RegisterForm
│       │
│       └── Route: /chat
│           └── ProtectedRoute
│               └── ChatPage
│                   ├── Sidebar
│                   │   ├── New Chat Button
│                   │   ├── Chat History
│                   │   ├── Settings Button
│                   │   ├── User Profile
│                   │   └── Logout Button
│                   │
│                   └── ChatArea
│                       ├── Messages Container
│                       │   └── MessageBubble (repeated)
│                       │       ├── Message Text
│                       │       ├── Timestamp
│                       │       ├── Actions (Copy, Delete, Like, etc.)
│                       │       └── Speak Button
│                       │
│                       └── Input Area
│                           ├── File Upload Button
│                           ├── Text Input
│                           ├── Voice Input Button
│                           └── Send Button
```

---

## Service Layer Architecture

```
Frontend Services
├── authService.js
│   ├── register()
│   ├── login()
│   ├── logout()
│   ├── getToken()
│   ├── getUser()
│   └── isAuthenticated()
│
├── chatService.js
│   ├── createSession()
│   ├── getSessions()
│   ├── getSessionMessages()
│   ├── saveMessage()
│   ├── updateMessageFeedback()
│   ├── uploadFile()
│   ├── getFiles()
│   ├── downloadFile()
│   └── deleteFile()
│
├── ollamaService.js
│   ├── generateResponse()
│   ├── generateStreamResponse()
│   └── checkConnection()
│
├── genomicsApiService.js
│   ├── searchVariants()
│   ├── searchDiseases()
│   ├── searchTests()
│   └── getGeneInfo()
│
└── voiceService.js
    ├── startListening()
    ├── stopListening()
    ├── speak()
    └── stopSpeaking()
```

---

## Database Schema (Simplified)

```
users
├── id (PK)
├── username
├── email
├── password_hash
├── first_name
├── last_name
├── role
├── is_active
├── last_login
└── created_at

chat_sessions
├── id (PK)
├── user_id (FK)
├── session_title
├── language
├── message_count
├── is_archived
├── created_at
└── last_message_at

chat_messages
├── id (PK)
├── session_id (FK)
├── user_id (FK)
├── sender_type (user/bot)
├── message_text
├── message_type (text/voice/file)
├── voice_url
├── file_url
├── liked
├── disliked
├── feedback_text
└── created_at

file_uploads
├── id (PK)
├── user_id (FK)
├── session_id (FK)
├── file_name
├── file_type
├── file_size
├── file_path
├── file_hash
├── description
├── download_count
└── created_at
```

---

## Environment Configuration

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_OLLAMA_URL=http://localhost:11434
REACT_APP_OLLAMA_MODEL=gemma
REACT_APP_DEFAULT_LANGUAGE=en
```

### Backend (.env)
```
DB_HOST=localhost
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
DB_PORT=3306
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma
```

---

## Security Architecture

```
Request Flow:
1. Frontend sends request with JWT token in Authorization header
2. Backend middleware (authenticateToken) verifies JWT
3. JWT verified against JWT_SECRET
4. Token checked against session_tokens table (not revoked)
5. User ID extracted from JWT payload
6. Request processed with user context
7. Response sent back to frontend

Token Storage:
- Frontend: localStorage (authToken)
- Backend: session_tokens table (for revocation)

Password Security:
- Frontend: Sent over HTTPS (in production)
- Backend: Hashed with bcryptjs (10 rounds)
- Database: Stored as hash only
```

---

## Deployment Architecture (Future)

```
Production Setup:
├── Frontend
│   └── Deployed to: Vercel/Netlify/AWS S3 + CloudFront
│
├── Backend
│   └── Deployed to: AWS EC2/Heroku/DigitalOcean
│
├── Database
│   └── Deployed to: AWS RDS/DigitalOcean Managed DB
│
├── Ollama
│   └── Deployed to: AWS EC2/GPU Instance
│
└── CDN
    └── CloudFront/Cloudflare for static assets
```

---

## Performance Considerations

### Frontend Optimization
- React lazy loading for routes
- Message virtualization for large chat histories
- Service worker for offline support
- Image optimization

### Backend Optimization
- Connection pooling (MySQL)
- Request caching
- Database indexing
- API rate limiting

### Database Optimization
- Indexes on frequently queried columns
- Partitioning for large tables
- Query optimization
- Regular backups

---

## Scalability Plan

### Phase 1 (Current)
- Single backend server
- Single database instance
- Local Ollama instance

### Phase 2 (Growth)
- Load balancer
- Multiple backend instances
- Database replication
- Ollama cluster

### Phase 3 (Scale)
- Microservices architecture
- Kubernetes orchestration
- Distributed caching (Redis)
- Message queue (RabbitMQ)

---

**Last Updated:** 2025-11-28  
**Architecture Version:** 1.0
