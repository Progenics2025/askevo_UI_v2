# Backend Startup Guide

## ✅ What You're Seeing

```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
```

**This is NOT an error!** This is the normal startup message showing:
- ✅ Nodemon is running
- ✅ File watcher is active
- ✅ Server is starting

## 🚀 Expected Output

After the startup message, you should see:

```
Progenics AI Backend running on http://localhost:3001
Environment: development
```

If you see this, the backend is **working perfectly**! ✅

## 🔍 Verify Backend is Running

### Option 1: Test Health Endpoint
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

### Option 2: Check Port
```bash
lsof -i :3001
```

Should show:
```
node    12345  user   20u  IPv4  123456      0t0  TCP *:3001 (LISTEN)
```

### Option 3: Check Process
```bash
ps aux | grep "node server.js"
```

Should show the running process.

## 📋 Backend Startup Checklist

- [ ] Backend dependencies installed: `npm list` shows packages
- [ ] .env file created: `ls -la backend/.env`
- [ ] Database connected: Can connect to MySQL
- [ ] Server started: `npm run dev` shows startup message
- [ ] Health check works: `curl http://localhost:3001/api/health`
- [ ] No error messages in console

## 🆘 If Backend Doesn't Start

### Check for Errors

Look for error messages after the startup message. Common errors:

#### Error 1: Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Fix:**
```bash
# Verify MySQL is running
mysql -u remote_user -p"Prolab#05" progenics_ai -e "SELECT 1;"
```

#### Error 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

#### Error 3: Module Not Found
```
Error: Cannot find module 'express'
```

**Fix:**
```bash
npm install
```

#### Error 4: Missing .env File
```
Error: Cannot read property 'DB_HOST' of undefined
```

**Fix:**
```bash
cp .env.example .env
```

## 📊 Backend Status

### Check if Backend is Running
```bash
# Method 1: curl
curl http://localhost:3001/api/health

# Method 2: netstat
netstat -tuln | grep 3001

# Method 3: lsof
lsof -i :3001

# Method 4: ps
ps aux | grep "node server"
```

### Check Backend Logs
```bash
# If running in terminal, you'll see logs directly
# If running in background, check logs:
tail -f backend.log
```

## 🎯 Complete Backend Setup

### 1. Navigate to Backend
```bash
cd askevo/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
cp .env.example .env
```

### 4. Verify Database Connection
```bash
mysql -u remote_user -p"Prolab#05" progenics_ai -e "SELECT 1;"
```

### 5. Start Backend
```bash
npm run dev
```

### 6. Verify It's Running
```bash
curl http://localhost:3001/api/health
```

## 📝 Backend Environment Variables

Make sure `.env` has these values:

```env
DB_HOST=localhost
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
DB_PORT=3306
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

## 🔄 Restart Backend

### Graceful Restart
```bash
# In the terminal where backend is running, press:
rs
```

### Force Restart
```bash
# Kill the process
pkill -f "node server.js"

# Start again
npm run dev
```

## 📊 Backend API Endpoints

Once running, test these endpoints:

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🎯 Next Steps

Once backend is running:

1. **Start Frontend** (in new terminal)
   ```bash
   cd askevo
   npm run dev
   ```

2. **Start Ollama** (in new terminal)
   ```bash
   ollama serve
   ```

3. **Open Application**
   ```
   http://localhost:5173
   ```

## 📞 Troubleshooting

### Backend won't start
1. Check Node.js: `node --version`
2. Check npm: `npm --version`
3. Check dependencies: `npm list`
4. Check .env file: `cat .env`
5. Check database: `mysql -u remote_user -p progenics_ai`

### Backend crashes immediately
1. Check for errors in console
2. Check .env file is correct
3. Check database is running
4. Check port 3001 is free

### Backend runs but can't connect
1. Check CORS_ORIGIN in .env
2. Check database connection
3. Check firewall settings
4. Check port forwarding

## ✅ Success Indicators

Backend is working when you see:

```
✓ Nodemon started
✓ Server listening on port 3001
✓ Database connected
✓ Health check responds
✓ Can register users
✓ Can login users
```

## 🎉 You're Ready!

If you see the startup message without errors, your backend is running successfully!

---

**Status:** ✅ Backend Running
**Port:** 3001
**Health Check:** http://localhost:3001/api/health
