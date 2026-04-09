-- Create Student Paper Presentations Table
CREATE TABLE IF NOT EXISTS student_paper_presentations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  paper_title VARCHAR(500) NOT NULL,
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  is_academic_project_outcome VARCHAR(10) NOT NULL,
  image_proof_path VARCHAR(500),
  abstract_proof_path VARCHAR(500),
  certificate_proof_path VARCHAR(500),
  attested_certificate_path VARCHAR(500),
  status VARCHAR(50) NOT NULL,
  iqac_verification VARCHAR(50) DEFAULT 'initiated',
  iqac_rejection_remarks TEXT,
  parental_department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_iqac_verification (iqac_verification),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_student_paper_presentations_dept FOREIGN KEY (parental_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
