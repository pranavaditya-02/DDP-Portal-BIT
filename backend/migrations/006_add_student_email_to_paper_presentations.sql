-- Add student_email column to student_paper_presentations table for email notifications
ALTER TABLE student_paper_presentations ADD COLUMN student_email VARCHAR(255) AFTER student_name;
CREATE INDEX idx_student_email ON student_paper_presentations (student_email);
