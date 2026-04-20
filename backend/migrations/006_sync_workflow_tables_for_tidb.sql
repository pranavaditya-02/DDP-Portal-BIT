-- TiDB/MySQL migration: workflow tables synced from local environment
-- Date: 2026-04-20
-- Purpose:
-- 1) Ensure all workflow tables exist in TiDB
-- 2) Add DB-backed workflow task definitions table
-- 3) Seed baseline target master, default academic year, and default task definitions

START TRANSACTION;

CREATE TABLE IF NOT EXISTS fap_target_master (
  id BIGINT NOT NULL AUTO_INCREMENT,
  target_code VARCHAR(60) NOT NULL,
  target_name VARCHAR(200) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_fap_target_code (target_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS fap_designation_target_rule (
  id BIGINT NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(20) NOT NULL,
  designation_id INT NOT NULL,
  target_id BIGINT NOT NULL,
  target_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_fap_rule (academic_year, designation_id, target_id),
  KEY idx_fap_rule_ay_desig (academic_year, designation_id),
  CONSTRAINT fk_fap_rule_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_fap_rule_target FOREIGN KEY (target_id) REFERENCES fap_target_master(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS faculty_fap_target_assignment (
  id BIGINT NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(20) NOT NULL,
  faculty_id VARCHAR(50) NOT NULL,
  designation_id INT NOT NULL,
  target_id BIGINT NOT NULL,
  assigned_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  assigned_on DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_faculty_target (academic_year, faculty_id, target_id),
  KEY idx_faculty_target_lookup (academic_year, faculty_id),
  CONSTRAINT fk_faculty_target_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_target_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_target_target FOREIGN KEY (target_id) REFERENCES fap_target_master(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS workflow_deadline_settings (
  academic_year VARCHAR(20) NOT NULL,
  settings_json JSON NOT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (academic_year),
  CONSTRAINT fk_workflow_deadline_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS workflow_academic_year_config (
  academic_year VARCHAR(20) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  paper_slot_limit TINYINT UNSIGNED NOT NULL DEFAULT 4,
  proposal_slot_limit TINYINT UNSIGNED NOT NULL DEFAULT 2,
  patent_slot_limit TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activated_at DATETIME NULL,
  PRIMARY KEY (academic_year),
  KEY idx_workflow_academic_year_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS faculty_workflow_task_status (
  id BIGINT NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(20) NOT NULL,
  faculty_id VARCHAR(50) NOT NULL,
  workflow_type ENUM('paper', 'patent', 'proposal') NOT NULL,
  slot_no TINYINT NOT NULL DEFAULT 1,
  task_code VARCHAR(120) NOT NULL,
  status ENUM('pending', 'completed') NOT NULL DEFAULT 'completed',
  payload_json JSON NULL,
  completed_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_faculty_workflow_status (academic_year, faculty_id, workflow_type, slot_no, task_code),
  KEY idx_faculty_workflow_lookup (academic_year, faculty_id),
  CONSTRAINT fk_faculty_workflow_status_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- New table added for DB-driven task definitions (migrated from hardcoded service constants)
CREATE TABLE IF NOT EXISTS workflow_task_definition (
  id BIGINT NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(20) NOT NULL,
  workflow_type ENUM('paper', 'patent', 'proposal') NOT NULL,
  sequence_no INT NOT NULL,
  base_id VARCHAR(120) NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_workflow_task_definition (academic_year, workflow_type, sequence_no),
  UNIQUE KEY uk_workflow_task_base (academic_year, workflow_type, base_id),
  KEY idx_workflow_task_lookup (academic_year, workflow_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Seed/refresh target master entries
INSERT INTO fap_target_master (target_code, target_name, unit, is_active) VALUES
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
  target_name = VALUES(target_name),
  unit = VALUES(unit),
  is_active = VALUES(is_active);

-- Ensure default academic year exists and stays active
INSERT INTO workflow_academic_year_config (
  academic_year,
  is_active,
  paper_slot_limit,
  proposal_slot_limit,
  patent_slot_limit,
  activated_at
) VALUES ('2026-27', 1, 4, 2, 1, NOW())
ON DUPLICATE KEY UPDATE academic_year = VALUES(academic_year);

UPDATE workflow_academic_year_config c
JOIN (
  SELECT academic_year
  FROM workflow_academic_year_config
  ORDER BY is_active DESC, updated_at DESC, academic_year DESC
  LIMIT 1
) pick ON pick.academic_year = c.academic_year
SET c.is_active = 1,
    c.activated_at = COALESCE(c.activated_at, NOW());

-- Seed default workflow task definitions for 2026-27
INSERT INTO workflow_task_definition (academic_year, workflow_type, sequence_no, base_id, title, is_active) VALUES
('2026-27', 'paper', 1, 'paper-title-finalization', 'Title Finalization', 1),
('2026-27', 'paper', 2, 'paper-abstract-preparation', 'Abstract Preparation', 1),
('2026-27', 'paper', 3, 'paper-first-draft-preparation', 'First Draft Preparation', 1),
('2026-27', 'paper', 4, 'paper-revised-draft-preparation', 'Revised Draft Preparation', 1),
('2026-27', 'paper', 5, 'paper-manuscript-submission', 'Manuscript Submission', 1),

('2026-27', 'proposal', 1, 'proposal-title-finalization', 'Title Finalization', 1),
('2026-27', 'proposal', 2, 'proposal-concept-presentation-rnd-approval', 'Concept Presentation & R&D Cell Approval', 1),
('2026-27', 'proposal', 3, 'proposal-initial-proposal-draft-preparation', 'Initial Proposal Draft Preparation', 1),
('2026-27', 'proposal', 4, 'proposal-revised-proposal-draft-preparation', 'Revised Proposal Draft Preparation', 1),
('2026-27', 'proposal', 5, 'proposal-final-proposal-submission', 'Final Proposal Submission', 1),

('2026-27', 'patent', 1, 'patent-title-finalization-with-bit-patent-office-approval', 'Title Finalization with BIT Patent Office Approval', 1),
('2026-27', 'patent', 2, 'patent-initial-patent-draft-preparation', 'Initial Patent Draft Preparation', 1),
('2026-27', 'patent', 3, 'patent-revised-patent-draft-preparation', 'Revised Patent Draft Preparation', 1),
('2026-27', 'patent', 4, 'patent-final-submission-of-patent-application', 'Final Submission of Patent Application', 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
