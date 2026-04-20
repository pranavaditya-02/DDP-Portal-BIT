import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/books');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const CREATE_BOOK_PUBLICATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS BookPublications (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

(async () => {
  try {
    const pool = getMysqlPool();
    await pool.query(CREATE_BOOK_PUBLICATIONS_TABLE_SQL);
  } catch (error) {
    logger.error('Error initializing BookPublications table:', error);
  }
})();

router.post('/', upload.single('proof'), async (req, res) => {
  try {
    const body = req.body as any;
    const file = req.file;
    const proofPath = file ? `/uploads/books/${file.filename}` : null;

    const pool = getMysqlPool();
    const sql = `INSERT INTO BookPublications (
      FacultyName, TaskID, Role,
      Author1_Type, Author1_Name, Author1_Details,
      Author2_Type, Author2_Name, Author2_Details,
      Author3_Type, Author3_Name, Author3_Details,
      Author4_Type, Author4_Name, Author4_Details,
      Author5_Type, Author5_Name, Author5_Details,
      Author6_Type, Author6_Name, Author6_Details,
      BookType, ChapterTitle, BookTitle, ISBN_Number, PublisherName, Indexing, DateOfPublication, ProofFilePath,
      ClaimedBy, AuthorPosition, RD_Verification
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      body.FacultyName || body.faculty || null,
      body.TaskID || null,
      body.Role || null,
      body.Author1_Type || null,
      body.Author1_Name || null,
      body.Author1_Details || null,
      body.Author2_Type || null,
      body.Author2_Name || null,
      body.Author2_Details || null,
      body.Author3_Type || null,
      body.Author3_Name || null,
      body.Author3_Details || null,
      body.Author4_Type || null,
      body.Author4_Name || null,
      body.Author4_Details || null,
      body.Author5_Type || null,
      body.Author5_Name || null,
      body.Author5_Details || null,
      body.Author6_Type || null,
      body.Author6_Name || null,
      body.Author6_Details || null,
      body.BookType || null,
      body.ChapterTitle || null,
      body.BookTitle || null,
      body.ISBN_Number || null,
      body.PublisherName || null,
      body.Indexing || null,
      body.DateOfPublication || null,
      proofPath,
      body.ClaimedBy || null,
      body.AuthorPosition || null,
      body.RD_Verification || 'Initiated',
    ];

    await pool.query(sql, params);
    return res.status(201).json({ success: true });
  } catch (error) {
    logger.error('Error saving book publication:', error);
    return res.status(500).json({ error: 'Failed to save book publication' });
  }
});

router.get('/', async (req, res) => {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query('SELECT * FROM BookPublications ORDER BY PublicationID DESC LIMIT 200');
    return res.json({ items: rows });
  } catch (error) {
    logger.error('Error listing book publications:', error);
    return res.status(500).json({ error: 'Failed to list book publications' });
  }
});

export default router;
