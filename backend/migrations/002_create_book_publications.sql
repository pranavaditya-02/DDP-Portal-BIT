-- Migration: create BookPublications table
CREATE TABLE IF NOT EXISTS BookPublications (
  PublicationID INT PRIMARY KEY AUTO_INCREMENT,
  FacultyName VARCHAR(255) NOT NULL,
  TaskID VARCHAR(100),
  Role ENUM('Author', 'Editor') NOT NULL,

  Author1_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author1_Name VARCHAR(255),
  Author1_Details TEXT,

  Author2_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author2_Name VARCHAR(255),
  Author2_Details TEXT,

  Author3_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author3_Name VARCHAR(255),
  Author3_Details TEXT,

  Author4_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author4_Name VARCHAR(255),
  Author4_Details TEXT,

  Author5_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author5_Name VARCHAR(255),
  Author5_Details TEXT,

  Author6_Type ENUM('BIT Faculty', 'BIT Student', 'Institute - National', 'Institute - International', 'Industry', 'NA'),
  Author6_Name VARCHAR(255),
  Author6_Details TEXT,

  BookType ENUM('Book Chapter', 'Book Publication') NOT NULL,
  ChapterTitle VARCHAR(500),
  BookTitle VARCHAR(500) NOT NULL,
  ISBN_Number VARCHAR(50),
  PublisherName VARCHAR(255),
  Indexing ENUM('WOS', 'SCOPUS', 'Not Indexed'),
  DateOfPublication DATE,
  ProofFilePath VARCHAR(500),

  ClaimedBy VARCHAR(255),
  AuthorPosition ENUM('First', 'Second', 'Third', 'Fourth', 'Corresponding', 'NA'),
  RD_Verification ENUM('Initiated', 'Approved', 'Rejected') DEFAULT 'Initiated'
);
