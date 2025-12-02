-- ============================================================================
-- PROGENICS AI - MySQL Database Setup
-- ============================================================================
-- Database: progenics_ai
-- User: remote_user
-- Password: Prolab#05
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS progenics_ai;
USE progenics_ai;

-- ============================================================================
-- TABLE 1: Users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('user', 'doctor', 'genetic_counselor', 'admin') DEFAULT 'user',
  language VARCHAR(10) DEFAULT 'en',
  auto_speak BOOLEAN DEFAULT FALSE,
  profile_picture_url VARCHAR(255),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 2: Chat Sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_title VARCHAR(255),
  session_description TEXT,
  language VARCHAR(10) DEFAULT 'en',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP NULL,
  message_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_archived (is_archived)
);

-- ============================================================================
-- TABLE 3: Chat Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  sender_type ENUM('user', 'bot') NOT NULL,
  message_text LONGTEXT NOT NULL,
  message_type ENUM('text', 'voice', 'file') DEFAULT 'text',
  voice_url VARCHAR(255),
  file_url VARCHAR(255),
  file_name VARCHAR(255),
  file_size INT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  liked BOOLEAN DEFAULT FALSE,
  disliked BOOLEAN DEFAULT FALSE,
  feedback_text TEXT,
  genomics_context JSON,
  ollama_model VARCHAR(50),
  response_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id),
  INDEX idx_user_id (user_id),
  INDEX idx_sender_type (sender_type),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 4: File Uploads
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_url VARCHAR(255),
  file_hash VARCHAR(64),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at),
  INDEX idx_file_type (file_type)
);

-- ============================================================================
-- TABLE 5: Genomics Data Cache
-- ============================================================================
CREATE TABLE IF NOT EXISTS genomics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data_type ENUM('variant', 'disease', 'test', 'association') NOT NULL,
  data_id VARCHAR(100),
  data_json JSON NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  hit_count INT DEFAULT 0,
  INDEX idx_cache_key (cache_key),
  INDEX idx_data_type (data_type),
  INDEX idx_expires_at (expires_at)
);

-- ============================================================================
-- TABLE 6: User Preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  auto_speak BOOLEAN DEFAULT FALSE,
  theme ENUM('light', 'dark') DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  ollama_url VARCHAR(255) DEFAULT 'http://localhost:11434',
  api_url VARCHAR(255) DEFAULT 'http://localhost:3001/api',
  voice_speed FLOAT DEFAULT 1.0,
  voice_pitch FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================================================
-- TABLE 7: User Activity Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type VARCHAR(50),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 8: Genomics Queries
-- ============================================================================
CREATE TABLE IF NOT EXISTS genomics_queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT,
  query_text TEXT NOT NULL,
  query_type ENUM('variant', 'disease', 'test', 'general') DEFAULT 'general',
  results_count INT DEFAULT 0,
  response_time_ms INT,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_query_type (query_type),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 9: Saved Responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message_id INT,
  title VARCHAR(255),
  description TEXT,
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 10: API Keys
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  key_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_api_key (api_key),
  INDEX idx_is_active (is_active)
);

-- ============================================================================
-- TABLE 11: Audit Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 12: Session Tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_type ENUM('access', 'refresh') DEFAULT 'access',
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: User Chat Statistics
CREATE OR REPLACE VIEW user_chat_stats AS
SELECT 
  u.id,
  u.username,
  u.email,
  COUNT(DISTINCT cs.id) as total_sessions,
  COUNT(DISTINCT cm.id) as total_messages,
  MAX(cm.created_at) as last_message_date,
  COUNT(DISTINCT CASE WHEN cm.sender_type = 'user' THEN cm.id END) as user_messages,
  COUNT(DISTINCT CASE WHEN cm.sender_type = 'bot' THEN cm.id END) as bot_messages
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
GROUP BY u.id, u.username, u.email;

-- View: Active Sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
  cs.id,
  cs.user_id,
  u.username,
  cs.session_title,
  cs.message_count,
  cs.created_at,
  cs.last_message_at,
  TIMESTAMPDIFF(MINUTE, cs.last_message_at, NOW()) as minutes_since_last_message
FROM chat_sessions cs
JOIN users u ON cs.user_id = u.id
WHERE cs.is_archived = FALSE
ORDER BY cs.last_message_at DESC;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for common queries
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX idx_chat_sessions_user_created ON chat_sessions(user_id, created_at);
CREATE INDEX idx_file_uploads_user_created ON file_uploads(user_id, created_at);
CREATE INDEX idx_genomics_cache_expires ON genomics_cache(expires_at);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin', 'admin@progenics.ai', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', TRUE);

-- Insert sample regular user (password: user123 - hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, language, is_active)
VALUES ('testuser', 'test@progenics.ai', '$2b$10$YourHashedPasswordHere', 'Test', 'User', 'user', 'en', TRUE);

-- Insert user preferences for sample users
INSERT INTO user_preferences (user_id, language, auto_speak, theme)
VALUES 
  (1, 'en', FALSE, 'dark'),
  (2, 'en', TRUE, 'dark');

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Get user chat history
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_user_chat_history(IN p_user_id INT, IN p_limit INT)
BEGIN
  SELECT 
    cs.id,
    cs.session_title,
    cs.message_count,
    cs.created_at,
    cs.last_message_at,
    COUNT(cm.id) as message_count
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cs.id = cm.session_id
  WHERE cs.user_id = p_user_id AND cs.is_archived = FALSE
  GROUP BY cs.id
  ORDER BY cs.last_message_at DESC
  LIMIT p_limit;
END //
DELIMITER ;

-- Procedure: Archive old sessions
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS archive_old_sessions(IN p_days INT)
BEGIN
  UPDATE chat_sessions
  SET is_archived = TRUE
  WHERE last_message_at < DATE_SUB(NOW(), INTERVAL p_days DAY)
  AND is_archived = FALSE;
END //
DELIMITER ;

-- Procedure: Clean expired tokens
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS clean_expired_tokens()
BEGIN
  DELETE FROM session_tokens
  WHERE expires_at < NOW() AND is_revoked = FALSE;
END //
DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update chat session message count
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_session_message_count
AFTER INSERT ON chat_messages
FOR EACH ROW
BEGIN
  UPDATE chat_sessions
  SET message_count = message_count + 1,
      last_message_at = NOW()
  WHERE id = NEW.session_id;
END //
DELIMITER ;

-- Trigger: Log user activity
DELIMITER //
CREATE TRIGGER IF NOT EXISTS log_user_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.last_login != OLD.last_login THEN
    INSERT INTO user_activity_log (user_id, activity_type, description)
    VALUES (NEW.id, 'login', 'User logged in');
  END IF;
END //
DELIMITER ;

-- ============================================================================
-- GRANTS (Permissions for remote_user)
-- ============================================================================

-- Grant all privileges on progenics_ai database to remote_user
GRANT ALL PRIVILEGES ON progenics_ai.* TO 'remote_user'@'%';
FLUSH PRIVILEGES;

-- ============================================================================
-- END OF DATABASE SETUP
-- ============================================================================
