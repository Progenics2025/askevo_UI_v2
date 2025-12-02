# Full Integration Guide - Progenics AI

Complete end-to-end setup guide for the entire Progenics AI system.

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Progenics AI System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React)          Backend (Node.js)   Database     │
│  ├─ ChatArea              ├─ Auth Routes      ├─ Users      │
│  ├─ Voice Input/Output    ├─ Chat Routes      ├─ Sessions   │
│  ├─ Multi-language        ├─ File Routes      ├─ Messages   │
│  └─ Settings              └─ Middleware       └─ Files      │
│                                                              │
│  Ollama (LLM)             Genomics API                       │
│  └─ Gemma Model           └─ Variants/Diseases/Tests        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] MySQL Server running
- [ ] Ollama installed with Gemma model
- [ ] Git (optional)
- [ ] Terminal/Command Prompt access

## 🚀 Step-by-Step Setup

### Phase 1: Database Setup (15 minutes)

#### 1.1 Connect to MySQL
```bash
mysql -u remote_user -p
# Password: Prolab#05
```

#### 1.2 Run Database Setup
```bash
# From MySQL prompt
source DATABASE_SETUP.sql;

# Or from terminal
mysql -u remote_user -p < DATABASE_SETUP.sql
```

#### 1.3 Verify Installation
```bash
mysql -u remote_user -p progenics_ai
mysql> SHOW TABLES;
```

Expected output: 12 tables created

### Phase 2: Backend Setup (20 minutes)

#### 2.1 Navigate to Backend
```bash
cd "CHAT BOT NEW/backend"
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
DB_PORT=3306
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

#### 2.4 Start Backend Server
```bash
npm run dev
```

Expected output:
```
Progenics AI Backend running on http://localhost:3001
Environment: development
```

### Phase 3: Ollama Setup (10 minutes)

#### 3.1 Start Ollama Server
```bash
ollama serve
```

Expected output:
```
Listening on 127.0.0.1:11434
```

#### 3.2 Verify Gemma Model
```bash
# In another terminal
ollama list
```

Should show: `gemma:latest`

### Phase 4: Frontend Setup (15 minutes)

#### 4.1 Navigate to Frontend
```bash
cd "CHAT BOT NEW"
```

#### 4.2 Install Dependencies
```bash
npm install
```

#### 4.3 Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_OLLAMA_URL=http://localhost:11434
REACT_APP_OLLAMA_MODEL=gemma
REACT_APP_GENOMICS_API_URL=http://localhost:3001/api
REACT_APP_DEFAULT_LANGUAGE=en
```

#### 4.4 Start Frontend Server
```bash
npm run dev
```

Expected output:
```
VITE v7.2.4  ready in 234 ms

➜  Local:   http://localhost:5173/
```

### Phase 5: Verification (10 minutes)

#### 5.1 Test Backend Health
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

#### 5.2 Test Frontend
Open browser: http://localhost:5173

#### 5.3 Test Registration
1. Click on login/register
2. Create new account
3. Verify user created in database:
```bash
mysql -u remote_user -p progenics_ai
mysql> SELECT * FROM users;
```

#### 5.4 Test Chat
1. Login with created account
2. Create new chat session
3. Send a message
4. Verify in database:
```bash
mysql> SELECT * FROM chat_sessions;
mysql> SELECT * FROM chat_messages;
```

## 🔄 Running All Services

### Terminal 1: Database (Already Running)
```bash
# MySQL should be running as a service
# Verify: mysql -u remote_user -p
```

### Terminal 2: Ollama
```bash
ollama serve
```

### Terminal 3: Backend
```bash
cd "CHAT BOT NEW/backend"
npm run dev
```

### Terminal 4: Frontend
```bash
cd "CHAT BOT NEW"
npm run dev
```

## 📊 Testing the System

### 1. User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token for next requests.

### 3. Create Chat Session
```bash
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_title": "Test Chat",
    "language": "en"
  }'
```

### 4. Save Message
```bash
curl -X POST http://localhost:3001/api/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "message_text": "Hello, how are you?",
    "sender_type": "user",
    "message_type": "text"
  }'
```

## 🎯 Feature Testing

### Chat Features
- [ ] Text messaging works
- [ ] Messages save to database
- [ ] Chat history displays
- [ ] Session creation works

### Voice Features
- [ ] Voice input works
- [ ] Transcription appears
- [ ] Voice output works
- [ ] Audio plays

### Language Features
- [ ] Language selector works
- [ ] UI updates on language change
- [ ] Voice language changes
- [ ] Preference saves

### File Features
- [ ] File upload works
- [ ] Files save to database
- [ ] File download works
- [ ] File deletion works

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Token management works

## 🔐 Security Checklist

- [ ] JWT_SECRET is set to a strong value
- [ ] Database password is secure
- [ ] CORS is configured correctly
- [ ] File upload restrictions are in place
- [ ] Input validation is working
- [ ] Error messages don't expose sensitive info

## 📈 Performance Optimization

### Frontend
```bash
# Build for production
npm run build

# Check bundle size
npm run build
# Look for dist/ folder size
```

### Backend
```bash
# Use connection pooling (already configured)
# Monitor with: SHOW PROCESSLIST;
```

### Database
```bash
# Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'progenics_ai';
```

## 🚀 Deployment Preparation

### Frontend Deployment
```bash
cd "CHAT BOT NEW"
npm run build
# Upload dist/ folder to hosting service
```

### Backend Deployment
```bash
cd "CHAT BOT NEW/backend"
npm install --production
NODE_ENV=production npm start
```

### Database Backup
```bash
mysqldump -u remote_user -p progenics_ai > backup_$(date +%Y%m%d).sql
```

## 🆘 Troubleshooting

### Frontend Won't Start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Won't Connect to Database
```bash
# Verify MySQL is running
mysql -u remote_user -p

# Check .env file
cat .env

# Verify database exists
mysql -u remote_user -p -e "SHOW DATABASES;"
```

### Ollama Not Responding
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Port Already in Use
```bash
# Find process
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :11434 # Ollama

# Kill process
kill -9 <PID>
```

## 📊 Database Monitoring

### Check Active Connections
```sql
SHOW PROCESSLIST;
```

### Check Table Sizes
```sql
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'progenics_ai'
ORDER BY size_mb DESC;
```

### Check User Statistics
```sql
SELECT * FROM user_chat_stats;
```

### Check Active Sessions
```sql
SELECT * FROM active_sessions;
```

## 🔄 Maintenance Tasks

### Daily
- Monitor error logs
- Check database size
- Verify all services running

### Weekly
- Backup database
- Clean expired tokens: `CALL clean_expired_tokens();`
- Review user activity

### Monthly
- Archive old sessions: `CALL archive_old_sessions(30);`
- Optimize tables: `OPTIMIZE TABLE users, chat_sessions, chat_messages;`
- Review performance metrics

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| DATABASE_SETUP.sql | Database schema and setup |
| DATABASE_GUIDE.md | Database documentation |
| BACKEND_SETUP.md | Backend setup guide |
| QUICK_START.md | Quick start guide |
| GENOMICS_SETUP.md | Genomics integration |
| ARCHITECTURE.md | System architecture |
| TROUBLESHOOTING.md | Common issues |

## 🎓 Learning Resources

- **React**: https://react.dev
- **Node.js**: https://nodejs.org/docs/
- **MySQL**: https://dev.mysql.com/doc/
- **JWT**: https://jwt.io/
- **Ollama**: https://ollama.ai/

## ✅ Final Checklist

- [ ] Database created and populated
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Ollama running on port 11434
- [ ] User registration works
- [ ] User login works
- [ ] Chat creation works
- [ ] Messages save to database
- [ ] Voice input works
- [ ] Voice output works
- [ ] Language switching works
- [ ] File upload works
- [ ] All tests pass

## 🎉 Success!

Your Progenics AI system is fully integrated and ready to use!

### Next Steps
1. Create test accounts
2. Test all features
3. Configure production settings
4. Deploy to production
5. Monitor performance

---

**Integration Complete!** 🧬

For detailed information on each component, refer to the specific setup guides.
