import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { getMysqlPool } from '../database/mysql'
import { logger } from '../utils/logger'

const router = express.Router()

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/competition/reports')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
  },
})

const makeFullUrl = (req: express.Request, p?: string | null) => {
  if (!p) return null
  if (!p.startsWith('/')) return p
  const origin = `${req.protocol}://${req.get('host')}`
  return `${origin}${p}`
}

const schema = z.object({
  student: z.preprocess((value) => Number(value), z.number().int().positive()),
  titleOfEvent: z.string().trim().min(1),
  levelOfEvent: z.string().trim().min(1),
  individualOrBatch: z.string().trim().min(1),
  numberOfParticipants: z.preprocess((value) => {
    if (value === '' || value === undefined || value === null) return null
    return Number(value)
  }, z.union([z.number().int().positive(), z.null()])).optional(),
  academicProject: z.string().trim().min(1),
  specifyProject: z.string().trim().optional().nullable(),
  fromDate: z.string().trim().min(1),
  toDate: z.string().trim().min(1),
  typeOfSponsorship: z.string().trim().min(1),
  sdgGoals: z.string().trim().min(1),
  status: z.string().trim().min(1),
  iqacVerification: z.string().trim().min(1),
  sponsorshipAmount: z.preprocess((value) => {
    if (value === '' || value === undefined || value === null) return null
    return Number(value)
  }, z.union([z.number().nonnegative(), z.null()])).optional(),
  place: z.enum(['I', 'II', 'III']).optional(),
  prizeType: z.enum(['Cash', 'Memento']).optional(),
  prizeAmount: z.preprocess((value) => {
    if (value === '' || value === undefined || value === null) return null
    return Number(value)
  }, z.union([z.number().nonnegative(), z.null()])).optional(),
})

router.post('/', upload.fields([
  { name: 'imageProof', maxCount: 1 },
  { name: 'abstractProof', maxCount: 1 },
  { name: 'originalCertProof', maxCount: 1 },
  { name: 'attestedCertProof', maxCount: 1 },
  { name: 'prizeProof', maxCount: 1 },
]), async (req, res) => {
  try {
    const parsed = schema.parse(req.body)
    const files = req.files as Record<string, Express.Multer.File[]> | undefined

    const imageProof = files?.imageProof?.[0] ?? null
    const abstractProof = files?.abstractProof?.[0] ?? null
    const originalCertProof = files?.originalCertProof?.[0] ?? null
    const attestedCertProof = files?.attestedCertProof?.[0] ?? null
    const prizeProof = files?.prizeProof?.[0] ?? null

    if (!imageProof || !abstractProof || !originalCertProof || !attestedCertProof) {
      return res.status(400).json({ error: 'All four proof files are required.' })
    }

    if (parsed.individualOrBatch === 'Batch' && !parsed.numberOfParticipants) {
      return res.status(400).json({ error: 'numberOfParticipants is required for Batch submissions' })
    }

    if (parsed.academicProject === 'Yes' && !parsed.specifyProject) {
      return res.status(400).json({ error: 'specifyProject is required when academicProject is Yes' })
    }

    if (parsed.typeOfSponsorship === 'Management' && (parsed.sponsorshipAmount === null || parsed.sponsorshipAmount === undefined)) {
      return res.status(400).json({ error: 'sponsorshipAmount is required for Management sponsorship' })
    }

    const fromDate = new Date(parsed.fromDate)
    const toDate = new Date(parsed.toDate)
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
      return res.status(400).json({ error: 'Invalid fromDate / toDate range' })
    }

    const pool = getMysqlPool()
    const [[sdgRow]] = await pool.query<any[]>(
      'SELECT id FROM sdg WHERE title = ? LIMIT 1',
      [parsed.sdgGoals],
    )

    if (!sdgRow || !sdgRow.id) {
      return res.status(400).json({ error: `SDG goal not found: ${parsed.sdgGoals}` })
    }

    const imageProofUrl = `/uploads/students/competition/reports/${imageProof.filename}`
    const abstractProofUrl = `/uploads/students/competition/reports/${abstractProof.filename}`
    const originalCertProofUrl = `/uploads/students/competition/reports/${originalCertProof.filename}`
    const attestedCertProofUrl = `/uploads/students/competition/reports/${attestedCertProof.filename}`
    const prizeProofUrl = prizeProof ? `/uploads/students/competition/reports/${prizeProof.filename}` : null

    const [result] = await pool.query<any>(
      `INSERT INTO competition_reports (
        student_id, sdg_id, title_of_event, level_of_event,
        individual_or_batch, number_of_participants,
        academic_project, specify_project,
        from_date, to_date,
        type_of_sponsorship, sponsorship_amount,
        image_proof_url, abstract_proof_url,
        original_cert_proof_url, attested_cert_proof_url,
        status, iqac_verification,
        place, prize_type, prize_amount, prize_proof_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsed.student,
        sdgRow.id,
        parsed.titleOfEvent,
        parsed.levelOfEvent,
        parsed.individualOrBatch,
        parsed.individualOrBatch === 'Batch' ? parsed.numberOfParticipants : null,
        parsed.academicProject,
        parsed.academicProject === 'Yes' ? parsed.specifyProject : null,
        parsed.fromDate,
        parsed.toDate,
        parsed.typeOfSponsorship,
        parsed.typeOfSponsorship === 'Management' ? parsed.sponsorshipAmount : null,
        imageProofUrl,
        abstractProofUrl,
        originalCertProofUrl,
        attestedCertProofUrl,
        parsed.status,
        parsed.iqacVerification || 'Initiated',
        parsed.place ?? null,
        parsed.prizeType ?? null,
        parsed.prizeAmount ?? null,
        prizeProofUrl,
      ],
    )

    const insertId = result.insertId ?? null
    return res.status(201).json({
      message: 'Competition report created successfully',
      id: insertId,
      report: {
        id: insertId,
        studentId: parsed.student,
        sdgId: sdgRow.id,
        titleOfEvent: parsed.titleOfEvent,
        levelOfEvent: parsed.levelOfEvent,
        individualOrBatch: parsed.individualOrBatch,
        numberOfParticipants: parsed.numberOfParticipants,
        academicProject: parsed.academicProject,
        specifyProject: parsed.specifyProject,
        fromDate: parsed.fromDate,
        toDate: parsed.toDate,
        typeOfSponsorship: parsed.typeOfSponsorship,
        sponsorshipAmount: parsed.sponsorshipAmount,
        status: parsed.status,
        iqacVerification: parsed.iqacVerification || 'Initiated',
        place: parsed.place ?? null,
        prizeType: parsed.prizeType ?? null,
        prizeAmount: parsed.prizeAmount ?? null,
        imageProofUrl: makeFullUrl(req, imageProofUrl),
        abstractProofUrl: makeFullUrl(req, abstractProofUrl),
        originalCertProofUrl: makeFullUrl(req, originalCertProofUrl),
        attestedCertProofUrl: makeFullUrl(req, attestedCertProofUrl),
        prizeProofUrl: makeFullUrl(req, prizeProofUrl),
      },
    })
  } catch (error) {
    logger.error('Error creating competition report:', error)
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => typeof err.message === 'string' ? err.message : JSON.stringify(err.message)).join('; ')
      return res.status(400).json({ error: message || 'Invalid competition report data' })
    }
    return res.status(500).json({ error: 'Failed to create competition report', message: error instanceof Error ? error.message : undefined })
  }
})

export default router
