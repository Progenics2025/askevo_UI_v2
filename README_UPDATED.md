# Progenics AI - Updated Setup (askevo folder)

Welcome! The project has been renamed from "CHAT BOT NEW" to "askevo" for better compatibility.

## ✅ What's Ready

Your complete Progenics AI system includes:

### Frontend (React)
- ✅ Chat interface with message history
- ✅ Voice input (speech-to-text)
- ✅ Voice output (text-to-speech)
- ✅ Multi-language support (English, Spanish, French)
- ✅ Settings panel
- ✅ Responsive design

### Backend (Node.js)
- ✅ 14 API endpoints
- ✅ JWT authentication
- ✅ File upload/download
- ✅ Chat session management
- ✅ User management
- ✅ Database integration

### Database (MySQL)
- ✅ 12 comprehensive tables
- ✅ 2 analytics views
- ✅ 3 stored procedures
- ✅ 2 automation triggers
- ✅ Complete schema with indexes

### External Services
- ✅ Ollama integration (Gemma model)
- ✅ Genomics API integration
- ✅ Web Speech API (voice)

## 🚀 Quick Start (5 Steps)

### Step 1: Verify Database
```bash
mysql -u remote_user -p"Prolab#05" progenics_ai -e "SHOW TABLES;"
```

Expected: 12 tables listed ✅

### Step 2: Start Backend
```bash
cd askevo/backend
npm install
npm run dev
```

Expected: `Backend running on http://localhost:3001` ✅

### Step 3: Start Frontend
```bash
cd askevo
npm install
npm run dev
```

Expected: `Local: http://localhost:5173` ✅

### Step 4: Start Ollama
```bash
ollama serve
```

Expected: `Listening on 127.0.0.1:11434` ✅

### Step 5: Open Application
```
http://localhost:5173
```

## 📁 Folder Structure

```
askevo/
├── src/                          # Frontend React code
│   ├── components/               # React components
│   ├── services/                 # API services
│   ├── config/                   # Configuration
│   └── styles/                   # CSS files
├── backend/                      # Node.js backend
│   ├── config/                   # Database config
│   ├── middleware/               # Authentication
│   ├── routes/                   # API routes
│   └── server.js                 # Main server
├── public/                       # Static files
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
├── DATABASE_SETUP.sql            # Database schema
├── DATABASE_SETUP_FIX.sql        # Fixed setup script
└── [documentation files]         # Setup guides
```

## 🔌 API Endpoints

### Authentication (3)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Chat (6)
- `POST /api/chat/sessions` - Create session
- `GET /api/chat/sessions` - Get sessions
- `GET /api/chat/sessions/:id/messages` - Get messages
- `PUT /api/chat/sessions/:id/archive` - Archive session
- `POST /api/chat/messages` - Save message
- `PUT /api/chat/messages/:id/feedback` - Save feedback

### Files (4)
- `POST /api/upload` - Upload file
- `GET /api/files` - Get files
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Health (1)
- `GET /api/health` - Health check

## 🔐 Database Credentials

```
Host: localhost
User: remote_user
Password: Prolab#05
Database: progenics_ai
Port: 3306
```

## 📊 Database Tables

1. **users** - User accounts
2. **chat_sessions** - Chat sessions
3. **chat_messages** - Messages
4. **file_uploads** - File storage
5. **genomics_cache** - API cache
6. **user_preferences** - User settings
7. **user_activity_log** - Activity log
8. **genomics_queries** - Search history
9. **saved_responses** - Saved messages
10. **api_keys** - API keys
11. **audit_log** - Audit trail
12. **session_tokens** - Auth tokens

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:3001/api/health
```

### Test Database
```bash
mysql -u remote_user -p"Prolab#05" progenics_ai -e "SELECT * FROM users;"
```

### Test Frontend
Open: `http://localhost:5173`

## 📚 Documentation

All documentation is in the `askevo/` directory:

| File | Purpose |
|------|---------|
| START_HERE.md | Start here |
| GETTING_STARTED.md | 30-minute guide |
| QUICK_START.md | 5-minute setup |
| FULL_INTEGRATION_GUIDE.md | Complete setup |
| DATABASE_GUIDE.md | Database reference |
| BACKEND_SETUP.md | Backend config |
| SETUP_WITH_NEW_FOLDER_NAME.md | Updated paths |
| TROUBLESHOOTING.md | Common issues |

## 🆘 Common Issues

### Port Already in Use
```bash
lsof -i :3001  # Find process
kill -9 <PID>  # Kill process
```

### Database Connection Error
```bash
mysql -u remote_user -p
# Enter: Prolab#05
```

### Module Not Found
```bash
cd askevo
rm -rf node_modules package-lock.json
npm install
```

### Ollama Not Running
```bash
ollama serve
```

## ✨ Features

### Chat
- ✅ Text messaging
- ✅ Message history
- ✅ Message feedback
- ✅ Session management

### Voice
- ✅ Speech-to-text input
- ✅ Text-to-speech output
- ✅ Multi-language support
- ✅ Auto-speak option

### Files
- ✅ File upload
- ✅ File download
- ✅ File deletion
- ✅ File metadata

### User Management
- ✅ Registration
- ✅ Login/Logout
- ✅ User profiles
- ✅ Preferences

### Security
- ✅ Password hashing
- ✅ JWT authentication
- ✅ Token management
- ✅ Input validation

## 🎯 Next Steps

1. **Read Documentation**
   - Start with `START_HERE.md`
   - Then `GETTING_STARTED.md`

2. **Verify Setup**
   - Check database: `mysql -u remote_user -p progenics_ai`
   - Check backend: `curl http://localhost:3001/api/health`
   - Check frontend: Open `http://localhost:5173`

3. **Test Features**
   - Register user
   - Login
   - Create chat session
   - Send messages
   - Upload files

4. **Deploy**
   - Build frontend: `npm run build`
   - Deploy backend to server
   - Configure production database

## 📞 Support

For issues:
1. Check `TROUBLESHOOTING.md`
2. Review error logs
3. Verify all services running
4. Check environment variables

## 🎉 You're Ready!

Your Progenics AI system is fully set up and ready to use.

**Start with `START_HERE.md` for detailed instructions.**

Happy coding! 🧬

---

**Folder Name:** askevo
**Status:** ✅ Ready to Use
**Last Updated:** November 28, 2025
