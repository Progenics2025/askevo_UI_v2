# Database Setup Guide - Progenics AI

Complete guide for setting up and managing the MySQL database for Progenics AI.

## 📋 Prerequisites

- MySQL Server 5.7+ or 8.0+
- MySQL Client or MySQL Workbench
- Database credentials:
  - User: `remote_user`
  - Password: `Prolab#05`

## 🚀 Quick Setup

### Step 1: Connect to MySQL

```bash
mysql -u remote_user -p
# Enter password: Prolab#05
```

### Step 2: Run Database Setup

```bash
# Option 1: From file
mysql -u remote_user -p < DATABASE_SETUP.sql

# Option 2: From MySQL prompt
mysql> source DATABASE_SETUP.sql;
```

### Step 3: Verify Installation

```bash
mysql -u remote_user -p progenics_ai
mysql> SHOW TABLES;
```

You should see 12 tables:
- users
- chat_sessions
- chat_messages
- file_uploads
- genomics_cache
- user_preferences
- user_activity_log
- genomics_queries
- saved_responses
- api_keys
- audit_log
- session_tokens

## 📊 Database Schema

### Table 1: users
Stores user account information.

```sql
Columns:
- id (INT, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (ENUM: user, doctor, genetic_counselor, admin)
- language (VARCHAR, default: en)
- auto_speak (BOOLEAN)
- profile_picture_url (VARCHAR)
- bio (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

### Table 2: chat_sessions
Stores chat session information.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- session_title (VARCHAR)
- session_description (TEXT)
- language (VARCHAR)
- is_archived (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_message_at (TIMESTAMP)
- message_count (INT)
```

### Table 3: chat_messages
Stores individual chat messages.

```sql
Columns:
- id (INT, PRIMARY KEY)
- session_id (INT, FOREIGN KEY)
- user_id (INT, FOREIGN KEY)
- sender_type (ENUM: user, bot)
- message_text (LONGTEXT)
- message_type (ENUM: text, voice, file)
- voice_url (VARCHAR)
- file_url (VARCHAR)
- file_name (VARCHAR)
- file_size (INT)
- is_edited (BOOLEAN)
- edited_at (TIMESTAMP)
- liked (BOOLEAN)
- disliked (BOOLEAN)
- feedback_text (TEXT)
- genomics_context (JSON)
- ollama_model (VARCHAR)
- response_time_ms (INT)
- created_at (TIMESTAMP)
```

### Table 4: file_uploads
Stores uploaded file information.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- session_id (INT, FOREIGN KEY)
- file_name (VARCHAR)
- file_type (VARCHAR)
- file_size (INT)
- file_path (VARCHAR)
- file_url (VARCHAR)
- file_hash (VARCHAR)
- description (TEXT)
- is_public (BOOLEAN)
- download_count (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table 5: genomics_cache
Caches genomics API responses.

```sql
Columns:
- id (INT, PRIMARY KEY)
- cache_key (VARCHAR, UNIQUE)
- data_type (ENUM: variant, disease, test, association)
- data_id (VARCHAR)
- data_json (JSON)
- source (VARCHAR)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- hit_count (INT)
```

### Table 6: user_preferences
Stores user preferences.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, UNIQUE, FOREIGN KEY)
- language (VARCHAR)
- auto_speak (BOOLEAN)
- theme (ENUM: light, dark)
- notifications_enabled (BOOLEAN)
- email_notifications (BOOLEAN)
- ollama_url (VARCHAR)
- api_url (VARCHAR)
- voice_speed (FLOAT)
- voice_pitch (FLOAT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table 7: user_activity_log
Logs user activities.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- activity_type (VARCHAR)
- description (TEXT)
- ip_address (VARCHAR)
- user_agent (VARCHAR)
- created_at (TIMESTAMP)
```

### Table 8: genomics_queries
Stores genomics search queries.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- session_id (INT, FOREIGN KEY)
- query_text (TEXT)
- query_type (ENUM: variant, disease, test, general)
- results_count (INT)
- response_time_ms (INT)
- is_saved (BOOLEAN)
- created_at (TIMESTAMP)
```

### Table 9: saved_responses
Stores saved bot responses.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- message_id (INT, FOREIGN KEY)
- title (VARCHAR)
- description (TEXT)
- tags (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table 10: api_keys
Stores user API keys.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- api_key (VARCHAR, UNIQUE)
- key_name (VARCHAR)
- is_active (BOOLEAN)
- last_used (TIMESTAMP)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
```

### Table 11: audit_log
Logs all database changes.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- action (VARCHAR)
- table_name (VARCHAR)
- record_id (INT)
- old_values (JSON)
- new_values (JSON)
- ip_address (VARCHAR)
- created_at (TIMESTAMP)
```

### Table 12: session_tokens
Stores authentication tokens.

```sql
Columns:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- token (VARCHAR, UNIQUE)
- token_type (ENUM: access, refresh)
- expires_at (TIMESTAMP)
- is_revoked (BOOLEAN)
- created_at (TIMESTAMP)
```

## 🔍 Views

### user_chat_stats
Shows user chat statistics.

```sql
SELECT * FROM user_chat_stats;
```

Returns:
- id, username, email
- total_sessions, total_messages
- last_message_date
- user_messages, bot_messages

### active_sessions
Shows active chat sessions.

```sql
SELECT * FROM active_sessions;
```

Returns:
- id, user_id, username
- session_title, message_count
- created_at, last_message_at
- minutes_since_last_message

## 🔧 Stored Procedures

### get_user_chat_history
Get user's chat history.

```sql
CALL get_user_chat_history(user_id, limit);
```

### archive_old_sessions
Archive sessions older than N days.

```sql
CALL archive_old_sessions(days);
```

### clean_expired_tokens
Remove expired authentication tokens.

```sql
CALL clean_expired_tokens();
```

## 📝 Common Queries

### Get user by email
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Get user's chat sessions
```sql
SELECT * FROM chat_sessions 
WHERE user_id = 1 AND is_archived = FALSE
ORDER BY last_message_at DESC;
```

### Get session messages
```sql
SELECT * FROM chat_messages 
WHERE session_id = 1
ORDER BY created_at ASC;
```

### Get user's files
```sql
SELECT * FROM file_uploads 
WHERE user_id = 1
ORDER BY created_at DESC;
```

### Get user statistics
```sql
SELECT * FROM user_chat_stats WHERE id = 1;
```

### Get active sessions
```sql
SELECT * FROM active_sessions LIMIT 10;
```

## 🔐 Security

### Password Hashing
Passwords are hashed using bcrypt with 10 salt rounds.

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Token Management
- Access tokens expire after 7 days
- Tokens can be revoked
- Expired tokens are automatically cleaned

### Audit Logging
All changes are logged in the audit_log table for compliance.

## 🚀 Backend Integration

### Environment Variables
Create `.env` file in backend directory:

```env
DB_HOST=localhost
DB_USER=remote_user
DB_PASSWORD=Prolab#05
DB_NAME=progenics_ai
DB_PORT=3306
JWT_SECRET=your_secret_key
```

### Connection Pool
The backend uses a connection pool with:
- 10 concurrent connections
- Connection timeout handling
- Keep-alive enabled

## 📊 Backup & Restore

### Backup Database
```bash
mysqldump -u remote_user -p progenics_ai > backup.sql
```

### Restore Database
```bash
mysql -u remote_user -p progenics_ai < backup.sql
```

### Backup Specific Table
```bash
mysqldump -u remote_user -p progenics_ai users > users_backup.sql
```

## 🧹 Maintenance

### Check Database Size
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'progenics_ai'
ORDER BY size_mb DESC;
```

### Optimize Tables
```sql
OPTIMIZE TABLE users, chat_sessions, chat_messages;
```

### Check Table Status
```sql
CHECK TABLE users, chat_sessions, chat_messages;
```

### Repair Table
```sql
REPAIR TABLE users;
```

## 📈 Performance Tips

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Connection Pool**: Use connection pooling in backend
3. **Query Optimization**: Use EXPLAIN to analyze queries
4. **Archive Old Data**: Regularly archive old sessions
5. **Clean Tokens**: Run clean_expired_tokens() periodically

## 🔄 Data Migration

### Add New User
```sql
INSERT INTO users (username, email, password_hash, first_name, last_name)
VALUES ('newuser', 'new@example.com', 'hashed_password', 'First', 'Last');
```

### Create New Session
```sql
INSERT INTO chat_sessions (user_id, session_title, language)
VALUES (1, 'My Chat', 'en');
```

### Save Message
```sql
INSERT INTO chat_messages (session_id, user_id, sender_type, message_text)
VALUES (1, 1, 'user', 'Hello, how are you?');
```

## 🆘 Troubleshooting

### Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

### Access Denied
```bash
# Verify credentials
mysql -u remote_user -p
# Enter password: Prolab#05
```

### Table Doesn't Exist
```bash
# Check database
USE progenics_ai;
SHOW TABLES;

# Re-run setup if needed
source DATABASE_SETUP.sql;
```

### Slow Queries
```sql
# Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# Check slow queries
SELECT * FROM mysql.slow_log;
```

## 📞 Support

For database issues:
1. Check MySQL error log: `/var/log/mysql/error.log`
2. Verify credentials and permissions
3. Check disk space: `df -h`
4. Monitor connections: `SHOW PROCESSLIST;`

---

**Database Setup Complete!** 🎉

Your Progenics AI database is ready to use.
