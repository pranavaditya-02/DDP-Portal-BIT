-- Migration: create supervisor_details table
CREATE TABLE IF NOT EXISTS supervisor_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id VARCHAR(50) NOT NULL,
    phd_completion_date DATE NOT NULL,
    supervisor_recognition_date DATE NOT NULL,
    phd_degree_awarded_date DATE NOT NULL,
    phd_degree_discipline VARCHAR(255) NOT NULL,
    recognition_received_date DATE NOT NULL,
    recognition_number VARCHAR(100) NOT NULL,
    recognition_faculty ENUM(
        'Computer Science and Engineering', 
        'Information Technology', 
        'Electronics and Communication Engineering', 
        'Electrical and Electronics Engineering', 
        'Mechanical Engineering', 
        'Civil Engineering', 
        'Technology', 
        'Science & Humanities', 
        'Management Sciences', 
        'Architecture & planning'
    ) NOT NULL,
    area_of_research VARCHAR(255) NOT NULL,
    recognition_order_pdf VARCHAR(255) NOT NULL,
    eligible_scholars_count INT NOT NULL DEFAULT 0,
    scholars_completed_count INT NOT NULL DEFAULT 0,
    scholars_completed_proof_pdf VARCHAR(255),
    scholars_pursuing_count INT NOT NULL DEFAULT 0,
    scholars_pursuing_proof_pdf VARCHAR(255),
    rd_verification_status ENUM('Initiated', 'Approved', 'Rejected') DEFAULT 'Initiated',
    CONSTRAINT fk_supervisor_faculty 
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
