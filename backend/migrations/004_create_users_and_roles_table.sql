-- Migration: Create users table for system user management
-- This table stores all system users with their roles and permissions

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) UNIQUE COMMENT 'Faculty/Employee ID (e.g., BIT-CSE-001)',
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Login username',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address',
  `name` VARCHAR(255) NOT NULL COMMENT 'Full name of the user',
  `department` VARCHAR(100) NULL COMMENT 'Department name',
  `designation` VARCHAR(100) NULL COMMENT 'Job designation',
  `role_id` INT NOT NULL DEFAULT 1 COMMENT 'Reference to roles table',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'User active status',
  `password_hash` VARCHAR(255) NULL COMMENT 'Hashed password (nullable for OAuth users)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `last_login` TIMESTAMP NULL COMMENT 'Last login timestamp',
  
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System users and authentication';

-- Create roles table if not exists
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Role name (faculty, hod, dean, verification, maintenance)',
  `description` TEXT NULL COMMENT 'Role description',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Role active status',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User roles and permissions';

-- Insert default roles if they don't exist
INSERT IGNORE INTO `roles` (`name`, `description`, `is_active`) VALUES
  ('faculty', 'Regular faculty member', 1),
  ('hod', 'Head of Department', 1),
  ('dean', 'Dean of academics', 1),
  ('verification', 'Verification committee member', 1),
  ('maintenance', 'System administrator', 1);
