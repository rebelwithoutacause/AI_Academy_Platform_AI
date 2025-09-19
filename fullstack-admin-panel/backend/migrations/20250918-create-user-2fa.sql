-- Migration: Create user_2fa and audit_logs tables for 2FA system
-- Date: 2025-09-18

-- Create user_2fa table
CREATE TABLE user_2fa (
  user_id INT PRIMARY KEY,
  method ENUM('none','email','telegram','totp') NOT NULL DEFAULT 'none',
  totp_secret VARCHAR(512) NULL, -- encrypted base32 secret
  telegram_chat_id VARCHAR(64) NULL,
  email_verified BOOL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NULL,
  entity_id INT NULL,
  details JSON NULL,
  ip VARCHAR(50) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Add indexes for performance
CREATE INDEX idx_user_2fa_method ON user_2fa(method);
CREATE INDEX idx_user_2fa_created_at ON user_2fa(created_at);

-- Insert default 2FA settings for existing demo users
INSERT INTO user_2fa (user_id, method, email_verified) VALUES
(1, 'email', TRUE),
(2, 'telegram', TRUE),
(3, 'totp', TRUE),
(4, 'none', FALSE)
ON DUPLICATE KEY UPDATE
method = VALUES(method),
email_verified = VALUES(email_verified);