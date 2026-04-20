import express from 'express';
import multer from 'multer';
import path from 'path';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.fields([
  { name: 'recognitionOrder', maxCount: 1 },
  { name: 'completedProof', maxCount: 1 },
  { name: 'pursuingProof', maxCount: 1 },
]), async (req, res) => {
  try {
    const body = req.body as any;
    const files = req.files as Express.Multer.File[] | any;

    const recognitionOrder = files?.recognitionOrder?.[0]?.filename || null;
    const completedProof = files?.completedProof?.[0]?.filename || null;
    const pursuingProof = files?.pursuingProof?.[0]?.filename || null;

    const pool = getMysqlPool();

    const facultyId = String(body.faculty_id || body.faculty || '').trim();
    if (!facultyId) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }

    const [facultyRows] = await pool.query('SELECT 1 FROM faculty WHERE id = ? LIMIT 1', [facultyId]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) {
      return res.status(400).json({ error: `Faculty ID ${facultyId} not found` });
    }

    const sql = `INSERT INTO supervisor_details
      (faculty_id, phd_completion_date, supervisor_recognition_date, phd_degree_awarded_date, phd_degree_discipline, recognition_received_date, recognition_number, recognition_faculty, area_of_research, recognition_order_pdf, eligible_scholars_count, scholars_completed_count, scholars_completed_proof_pdf, scholars_pursuing_count, scholars_pursuing_proof_pdf, rd_verification_status)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      facultyId,
      body.completionDate || body.phd_completion_date || null,
      body.recognitionDate || body.supervisor_recognition_date || null,
      body.phdAwardDate || body.phd_degree_awarded_date || null,
      body.phdDiscipline || body.phd_degree_discipline || null,
      body.recognitionReceivedDate || body.recognition_received_date || null,
      body.recognitionNumber || body.recognition_number || null,
      body.facultyDepartment || body.recognition_faculty || null,
      body.researchArea || body.area_of_research || null,
      recognitionOrder,
      Number(body.eligibleScholars || body.eligible_scholars_count || 0),
      Number(body.scholarsCompleted || body.scholars_completed_count || 0),
      completedProof,
      Number(body.scholarsPursuing || body.scholars_pursuing_count || 0),
      pursuingProof,
      body.verification || body.rd_verification_status || 'Initiated',
    ];

    await pool.query(sql, params);

    return res.json({ success: true });
  } catch (error) {
    logger.error('Error saving supervisor detail:', error);
    return res.status(500).json({ error: 'Failed to save supervisor detail' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT sd.id,
              COALESCE(f.name, sd.faculty_id) AS faculty_name,
              sd.recognition_number,
              sd.phd_degree_discipline AS discipline,
              sd.eligible_scholars_count AS eligible_scholars_count,
              sd.scholars_completed_count AS scholars_completed_count,
              sd.scholars_pursuing_count AS scholars_pursuing_count,
              sd.rd_verification_status AS verification,
              sd.recognition_received_date AS submitted_on
       FROM supervisor_details sd
       LEFT JOIN faculty f ON f.id = sd.faculty_id
       ORDER BY sd.id DESC`,
    );

    return res.json(rows);
  } catch (error) {
    logger.error('Error fetching supervisor details:', error);
    return res.status(500).json({ error: 'Failed to fetch supervisor details' });
  }
});

export default router;
