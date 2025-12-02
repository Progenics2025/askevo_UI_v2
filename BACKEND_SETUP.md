# Backend Setup Guide - Progenics AI

Complete guide for setting up and running the Node.js backend server.

## 📋 Prerequisites

- Node.js 16+ (https://nodejs.org/)
- npm or yarn
- MySQL Server running with progenics_ai database
- Database credentials:
  - User: `remote_user`
  - Password: `Prolab#05`

## 🚀 Quick Setup

### Step 1: Navigate to Backend Directory

```bash
cd "CHAT BOT NEW/backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
DB_HOST=localhost
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
DB_PORT=3306
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
Progenics AI Backend running on http://localhost:3001
Environment: development
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── chat.js              # Chat endpoints
│   └── files.js             # File upload endpoints
├── uploads/                 # Uploaded files directory
├── server.js                # Main server file
├── package.json
└── .env.example
```

## 🔌 API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user_id": 1
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Logout successful"
}
```

### Chat Sessions

#### Create Session
```
POST /api/chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_title": "My Chat",
  "language": "en"
}

Response: 201 Created
{
  "message": "Session created",
  "session_id": 1
}
```

#### Get Sessions
```
GET /api/chat/sessions
Authorization: Bearer <token>

Response: 200 OK
{
  "sessions": [
    {
      "id": 1,
      "session_title": "My Chat",
      "message_count": 5,
      "created_at": "2024-01-01T10:00:00Z",
      "last_message_at": "2024-01-01T10:30:00Z",
      "is_archived": false
    }
  ]
}
```

#### Get Session Messages
```
GET /api/chat/sessions/:sessionId/messages
Authorization: Bearer <token>

Response: 200 OK
{
  "messages": [
    {
      "id": 1,
      "sender_type": "user",
      "message_text": "Hello",
      "message_type": "text",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Archive Session
```
PUT /api/chat/sessions/:sessionId/archive
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Session archived"
}
```

### Chat Messages

#### Save Message
```
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": 1,
  "message_text": "Hello, how are you?",
  "sender_type": "user",
  "message_type": "text"
}

Response: 201 Created
{
  "message": "Message saved",
  "message_id": 1
}
```

#### Update Message Feedback
```
PUT /api/chat/messages/:messageId/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "liked": true,
  "disliked": false,
  "feedback_text": "Great response!"
}

Response: 200 OK
{
  "message": "Feedback saved"
}
```

### File Upload

#### Upload File
```
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <binary file>
- session_id: 1 (optional)
- description: "My file" (optional)

Response: 201 Created
{
  "message": "File uploaded successfully",
  "file_id": 1,
  "file_name": "document.pdf",
  "file_size": 1024000
}
```

#### Get Files
```
GET /api/files
Authorization: Bearer <token>

Response: 200 OK
{
  "files": [
    {
      "id": 1,
      "file_name": "document.pdf",
      "file_type": "application/pdf",
      "file_size": 1024000,
      "created_at": "2024-01-01T10:00:00Z",
      "download_count": 2
    }
  ]
}
```

#### Download File
```
GET /api/files/:fileId/download
Authorization: Bearer <token>

Response: 200 OK (file binary)
```

#### Delete File
```
DELETE /api/files/:fileId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "File deleted"
}
```

## 🔐 Authentication

### JWT Token
- Tokens are issued on login
- Tokens expire after 7 days (configurable)
- Include token in Authorization header: `Bearer <token>`
- Tokens are stored in database and can be revoked

### Token Refresh
Tokens are automatically refreshed on each request if they're about to expire.

## 📤 File Upload

### Supported File Types
- PDF: `application/pdf`
- Text: `text/plain`
- JSON: `application/json`
- Images: `image/png`, `image/jpeg`

### File Size Limit
Default: 50MB (configurable in .env)

### Upload Directory
Files are stored in `backend/uploads/` directory

## 🧪 Testing Endpoints

### Using cURL

#### Register
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

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Create Session
```bash
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_title": "My Chat",
    "language": "en"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set Authorization header: `Bearer <token>`
3. Test each endpoint

## 🐛 Debugging

### Enable Debug Logging
```bash
DEBUG=* npm run dev
```

### Check Database Connection
```javascript
// In server.js
pool.getConnection()
  .then(conn => {
    console.log('Database connected');
    conn.release();
  })
  .catch(err => console.error('Database error:', err));
```

### View Request Logs
Morgan middleware logs all requests:
```
GET /api/health 200 1.234 ms - 45
POST /api/auth/login 200 234.567 ms - 456
```

## 🚀 Deployment

### Production Build
```bash
npm install --production
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
PORT=3001
JWT_SECRET=your_very_secure_secret_key
CORS_ORIGIN=https://yourdomain.com
```

### Using PM2 (Process Manager)
```bash
npm install -g pm2

# Start
pm2 start server.js --name "progenics-backend"

# Monitor
pm2 monit

# Logs
pm2 logs progenics-backend

# Restart
pm2 restart progenics-backend
```

### Using Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t progenics-backend .
docker run -p 3001:3001 --env-file .env progenics-backend
```

## 🔧 Configuration

### Database Connection Pool
```javascript
// config/database.js
const pool = mysql.createPool({
  connectionLimit: 10,      // Max connections
  queueLimit: 0,            // Queue limit
  enableKeepAlive: true,    // Keep connections alive
  keepAliveInitialDelayMs: 0
});
```

### CORS Configuration
```javascript
// server.js
cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
})
```

### File Upload Configuration
```javascript
// routes/files.js
multer({
  limits: { fileSize: 52428800 },  // 50MB
  fileFilter: (req, file, cb) => {
    // Allowed types
  }
})
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### Database Queries
Monitor slow queries in MySQL:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

Solution:
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database exists: `mysql -u remote_user -p progenics_ai`

### JWT Secret Not Set
```
Error: JWT_SECRET is not defined
```

Solution:
- Add JWT_SECRET to .env file
- Restart server

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

Solution:
- Check CORS_ORIGIN in .env
- Ensure frontend URL matches CORS_ORIGIN
- Restart server

### File Upload Error
```
Error: File too large
```

Solution:
- Increase MAX_FILE_SIZE in .env
- Ensure upload directory exists and is writable

## 📝 Logs

### Application Logs
```bash
# View logs
npm run dev

# Or with PM2
pm2 logs progenics-backend
```

### Database Logs
```bash
# MySQL error log
tail -f /var/log/mysql/error.log
```

## 🔄 Maintenance

### Clean Expired Tokens
```bash
# Run periodically (e.g., daily)
mysql -u remote_user -p progenics_ai -e "CALL clean_expired_tokens();"
```

### Archive Old Sessions
```bash
# Archive sessions older than 30 days
mysql -u remote_user -p progenics_ai -e "CALL archive_old_sessions(30);"
```

### Database Backup
```bash
mysqldump -u remote_user -p progenics_ai > backup_$(date +%Y%m%d).sql
```

## 📞 Support

For backend issues:
1. Check error logs
2. Verify database connection
3. Check environment variables
4. Review API endpoint documentation
5. Test with cURL or Postman

---

**Backend Setup Complete!** 🎉

Your Progenics AI backend is ready to serve the frontend application.
