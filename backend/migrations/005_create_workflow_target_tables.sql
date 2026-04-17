-- Migration: Create workflow target tables for designation-based FAP assignments

CREATE TABLE IF NOT EXISTS `fap_target_master` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `target_code` VARCHAR(60) NOT NULL,
  `target_name` VARCHAR(200) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fap_target_code` (`target_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master list of FAP targets';

CREATE TABLE IF NOT EXISTS `fap_designation_target_rule` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `academic_year` VARCHAR(20) NOT NULL COMMENT 'e.g., 2026-27',
  `designation_id` INT NOT NULL,
  `target_id` BIGINT NOT NULL,
  `target_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fap_rule` (`academic_year`, `designation_id`, `target_id`),
  KEY `idx_fap_rule_ay_desig` (`academic_year`, `designation_id`),
  CONSTRAINT `fk_fap_rule_designation` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fap_rule_target` FOREIGN KEY (`target_id`) REFERENCES `fap_target_master` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Designation-wise target rules per academic year';

CREATE TABLE IF NOT EXISTS `faculty_fap_target_assignment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `academic_year` VARCHAR(20) NOT NULL,
  `faculty_id` VARCHAR(50) NOT NULL,
  `designation_id` INT NOT NULL,
  `target_id` BIGINT NOT NULL,
  `assigned_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `assigned_on` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_faculty_target` (`academic_year`, `faculty_id`, `target_id`),
  KEY `idx_faculty_target_lookup` (`academic_year`, `faculty_id`),
  CONSTRAINT `fk_faculty_target_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_target_designation` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_target_target` FOREIGN KEY (`target_id`) REFERENCES `fap_target_master` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Faculty-level assigned targets';

CREATE TABLE IF NOT EXISTS `workflow_deadline_settings` (
  `academic_year` VARCHAR(20) NOT NULL,
  `settings_json` JSON NOT NULL,
  `updated_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`academic_year`),
  CONSTRAINT `fk_workflow_deadline_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stored workflow deadline settings by academic year';

CREATE TABLE IF NOT EXISTS `faculty_workflow_task_status` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `academic_year` VARCHAR(20) NOT NULL,
  `faculty_id` VARCHAR(50) NOT NULL,
  `workflow_type` ENUM('paper', 'patent', 'proposal') NOT NULL,
  `slot_no` TINYINT NOT NULL DEFAULT 1,
  `task_code` VARCHAR(120) NOT NULL,
  `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'completed',
  `payload_json` JSON NULL,
  `completed_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_faculty_workflow_status` (`academic_year`, `faculty_id`, `workflow_type`, `slot_no`, `task_code`),
  KEY `idx_faculty_workflow_lookup` (`academic_year`, `faculty_id`),
  CONSTRAINT `fk_faculty_workflow_status_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Faculty workflow completion status';

INSERT INTO `fap_target_master` (`target_code`, `target_name`, `unit`, `is_active`) VALUES
  ('wos_sci_count', 'WoS/SCI Journal Publications', 'count', 1),
  ('scopus_count', 'Scopus Journal Publications', 'count', 1),
  ('paper_target_count', 'Paper Target Count', 'count', 1),
  ('patent_count', 'Patent Target', 'count', 1),
  ('funding_proposal_slot_count', 'Funding Proposal Slot Count', 'count', 1),
  ('consultancy_lakh', 'Industrial Consultancy', 'lakhs', 1),
  ('research_funding_lakh', 'Research Funding', 'lakhs', 1),
  ('nptel_course_count', 'NPTEL Courses', 'count', 1),
  ('fdp_sttp_count', 'FDP/STTP Attendance', 'count', 1)
ON DUPLICATE KEY UPDATE
  `target_name` = VALUES(`target_name`),
  `unit` = VALUES(`unit`),
  `is_active` = VALUES(`is_active`);
