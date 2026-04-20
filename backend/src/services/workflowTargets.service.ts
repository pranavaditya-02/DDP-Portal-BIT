import type { OkPacket, RowDataPacket } from 'mysql2'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import getMysqlPool from '../database/mysql'

const DEFAULT_ACADEMIC_YEAR = '2026-27'
const DEFAULT_SLOT_LIMITS = {
  paperSlots: 4,
  proposalSlots: 2,
  patentSlots: 1,
}

type TargetCode =
  | 'wos_sci_count'
  | 'scopus_count'
  | 'paper_target_count'
  | 'patent_count'
  | 'funding_proposal_slot_count'
  | 'consultancy_lakh'
  | 'research_funding_lakh'
  | 'nptel_course_count'
  | 'fdp_sttp_count'

type TargetMasterRow = RowDataPacket & {
  id: number
  target_code: TargetCode
  target_name: string
  unit: string
}

type DesignationRow = RowDataPacket & {
  id: number
  designation_name: string
}

type RuleRow = RowDataPacket & {
  designation_id: number
  designation_name: string
  target_code: TargetCode
  target_value: number | null
}

type FacultyCountRow = RowDataPacket & {
  designation_id: number
  faculty_count: number
}

type FacultyAssignmentRow = RowDataPacket & {
  faculty_id: string
  designation_id: number
  designation_name: string
  target_code: TargetCode
  assigned_value: number
}

type FacultyResolvedDesignationRow = RowDataPacket & {
  designation_id: number | null
}

type WorkflowAcademicYearConfigRow = RowDataPacket & {
  academic_year: string
  is_active: 0 | 1
  paper_slot_limit: number
  proposal_slot_limit: number
  patent_slot_limit: number
  created_at: Date | string
  updated_at: Date | string
  activated_at: Date | string | null
}

type WorkflowTaskStatusRow = RowDataPacket & {
  workflow_type: 'paper' | 'patent' | 'proposal'
  slot_no: number
  task_code: string
}

type WorkflowTaskDefinitionRow = RowDataPacket & {
  workflow_type: 'paper' | 'patent' | 'proposal'
  sequence_no: number
  base_id: string
  title: string
}

type FacultyDirectoryRow = RowDataPacket & {
  faculty_id: string
  name: string
  email: string | null
  department: string | null
  designation: string | null
}

type CountRow = RowDataPacket & {
  total: number
}

type ComplianceLastUpdatedRow = RowDataPacket & {
  last_updated: Date | string | null
}

const FACULTY_RESOLVED_DESIGNATION_ID_SQL = `
  COALESCE(
    CASE
      WHEN TRIM(f.designation_id) REGEXP '^[0-9]+$' THEN CAST(TRIM(f.designation_id) AS UNSIGNED)
      ELSE NULL
    END,
    d_name.id
  )
`

export interface WorkflowTaskPayload {
  id: string
  baseId: string
  title: string
  type: 'paper' | 'patent' | 'proposal'
  slotNo: number
  deadlineISO: string
  completed: boolean
}

export interface WorkflowPlanPayload {
  academicYear: string
  paperTargets: number
  proposalSlots: number
  patentEnabled: boolean
  deadlineMap: Record<string, string>
  completedTaskIds: string[]
  tasks: WorkflowTaskPayload[]
}

export interface DesignationTargetRule {
  designationId: number
  designationName: string
  facultyCount: number
  academicYear: string
  targets: Record<string, number>
}

export interface FacultyTargetSummary {
  facultyId: string
  designationId: number
  designationName: string
  academicYear: string
  targets: Record<string, number>
}

export interface WorkflowTargetDefinition {
  code: string
  name: string
  unit: string
}

export interface AdminFacultyComplianceRow {
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  completedTasks: number
  pendingTasks: number
  completionRate: number
  completedTaskIds: string[]
}

export interface AdminTaskComplianceRow {
  key: string
  task: string
  workflow: string
  type: 'paper' | 'patent' | 'proposal'
  targetIndex: number
  deadlineISO: string
  completionRate: number
  completedFaculty: number
  pendingFaculty: number
  statusLabel: 'Upcoming' | 'Near deadline' | 'Overdue'
}

export interface AdminComplianceSummaryPayload {
  rows: AdminFacultyComplianceRow[]
  tasks: AdminTaskComplianceRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface WorkflowAcademicYearConfig {
  academicYear: string
  isActive: boolean
  paperSlots: number
  proposalSlots: number
  patentSlots: number
  createdAt: string
  updatedAt: string
  activatedAt: string | null
}

type AdminComplianceTaskAccumulator = {
  key: string
  task: string
  workflow: string
  type: 'paper' | 'patent' | 'proposal'
  targetIndex: number
  deadlineISO: string
  totalFaculty: number
  completedFaculty: number
}

const TARGETS: Array<{ code: TargetCode; name: string; unit: string }> = [
  { code: 'wos_sci_count', name: 'WoS/SCI Journal Publications', unit: 'count' },
  { code: 'scopus_count', name: 'Scopus Journal Publications', unit: 'count' },
  { code: 'paper_target_count', name: 'Paper Target Count', unit: 'count' },
  { code: 'patent_count', name: 'Patent Target', unit: 'count' },
  { code: 'funding_proposal_slot_count', name: 'Funding Proposal Slot Count', unit: 'count' },
  { code: 'consultancy_lakh', name: 'Industrial Consultancy', unit: 'lakhs' },
  { code: 'research_funding_lakh', name: 'Research Funding', unit: 'lakhs' },
  { code: 'nptel_course_count', name: 'NPTEL Courses', unit: 'count' },
  { code: 'fdp_sttp_count', name: 'FDP/STTP Attendance', unit: 'count' },
]

const normalizeDesignationName = (value: string) => value.trim().toUpperCase()

const buildTaskId = (baseId: string, slotNo: number) => (slotNo <= 1 ? baseId : `${baseId}__t${slotNo}`)

const getWorkflowLabel = (type: 'paper' | 'patent' | 'proposal') => {
  if (type === 'paper') return 'Journal Paper'
  if (type === 'proposal') return 'Funding Proposal'
  return 'Patent'
}

const getDeadlineStatusLabel = (deadlineISO: string): 'Upcoming' | 'Near deadline' | 'Overdue' => {
  if (!deadlineISO) return 'Upcoming'

  const now = new Date()
  const deadline = new Date(deadlineISO)
  const msInDay = 1000 * 60 * 60 * 24
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / msInDay)

  if (diffDays < 0) return 'Overdue'
  if (diffDays <= 14) return 'Near deadline'
  return 'Upcoming'
}

const STATIC_FALLBACK_WORKFLOW_DEADLINE_MAP: Record<string, string> = {
  'paper-title-finalization': '2026-06-01',
  'paper-abstract-preparation': '2026-06-15',
  'paper-first-draft-preparation': '2026-06-29',
  'paper-revised-draft-preparation': '2026-07-13',
  'paper-manuscript-submission': '2026-07-20',
  'paper-title-finalization__t2': '2026-07-22',
  'paper-abstract-preparation__t2': '2026-08-03',
  'paper-first-draft-preparation__t2': '2026-08-17',
  'paper-revised-draft-preparation__t2': '2026-08-31',
  'paper-manuscript-submission__t2': '2026-09-14',
  'paper-title-finalization__t3': '2026-09-16',
  'paper-abstract-preparation__t3': '2026-09-28',
  'paper-first-draft-preparation__t3': '2026-10-12',
  'paper-revised-draft-preparation__t3': '2026-10-26',
  'paper-manuscript-submission__t3': '2026-11-06',
  'paper-title-finalization__t4': '2026-11-09',
  'paper-abstract-preparation__t4': '2026-11-16',
  'paper-first-draft-preparation__t4': '2026-11-30',
  'paper-revised-draft-preparation__t4': '2026-12-14',
  'paper-manuscript-submission__t4': '2026-12-28',
  'proposal-title-finalization': '2026-06-01',
  'proposal-concept-presentation-rnd-approval': '2026-06-16',
  'proposal-initial-proposal-draft-preparation': '2026-07-11',
  'proposal-revised-proposal-draft-preparation': '2026-07-30',
  'proposal-final-proposal-submission': '',
  'proposal-title-finalization__t2': '2026-08-01',
  'proposal-concept-presentation-rnd-approval__t2': '2026-08-16',
  'proposal-initial-proposal-draft-preparation__t2': '2026-09-11',
  'proposal-revised-proposal-draft-preparation__t2': '2026-09-30',
  'proposal-final-proposal-submission__t2': '',
  'patent-title-finalization-with-bit-patent-office-approval': '2026-07-01',
  'patent-initial-patent-draft-preparation': '2026-07-25',
  'patent-revised-patent-draft-preparation': '2026-08-20',
  'patent-final-submission-of-patent-application': '2026-08-31',
}

const toIsoFromDocDate = (value: string) => {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const extractSection = (text: string, startMarker: string, endMarker?: string) => {
  const startIndex = text.indexOf(startMarker)
  if (startIndex === -1) {
    return ''
  }

  const fromStart = text.slice(startIndex)
  if (!endMarker) {
    return fromStart
  }

  const endIndex = fromStart.indexOf(endMarker)
  if (endIndex === -1) {
    return fromStart
  }

  return fromStart.slice(0, endIndex)
}

const matchDatesForLabel = (text: string, label: string, count: number) => {
  const dateGroup = '(\\d{2}\\.\\d{2}\\.\\d{4})'
  const pattern = new RegExp(`${escapeRegex(label)}\\s+${Array.from({ length: count }, () => dateGroup).join('\\s+')}`, 'i')
  const match = text.match(pattern)
  if (!match) {
    return [] as string[]
  }

  return match.slice(1).map((dateValue) => toIsoFromDocDate(dateValue))
}

const buildDeadlineMapFromDocText = (text: string): Record<string, string> => {
  const result: Record<string, string> = {}

  const paperSection = extractSection(
    text,
    'Journal Publications - Individual Faculty Action Plan',
    'Funding Proposal Submission - Individual Faculty Action Plan',
  )
  const proposalSection = extractSection(
    text,
    'Funding Proposal Submission - Individual Faculty Action Plan',
    'Patent Submission - Individual Faculty Action Plan',
  )
  const patentSection = extractSection(text, 'Patent Submission - Individual Faculty Action Plan')

  const paperMatrix: Array<{ id: string; label: string }> = [
    { id: 'paper-title-finalization', label: 'Title Finalization' },
    { id: 'paper-abstract-preparation', label: 'Abstract Preparation' },
    { id: 'paper-first-draft-preparation', label: 'First Draft Preparation' },
    { id: 'paper-revised-draft-preparation', label: 'Revised Draft Preparation' },
    { id: 'paper-manuscript-submission', label: 'Manuscript Submission' },
  ]

  for (const item of paperMatrix) {
    const dates = matchDatesForLabel(paperSection, item.label, 4)
    if (dates.length !== 4) continue

    result[item.id] = dates[0]
    result[`${item.id}__t2`] = dates[1]
    result[`${item.id}__t3`] = dates[2]
    result[`${item.id}__t4`] = dates[3]
  }

  const proposalMatrix: Array<{ id: string; label: string }> = [
    { id: 'proposal-title-finalization', label: 'Title Finalization' },
    { id: 'proposal-concept-presentation-rnd-approval', label: 'Concept Presentation & R&D Cell Approval' },
    { id: 'proposal-initial-proposal-draft-preparation', label: 'Initial Proposal Draft Preparation' },
    { id: 'proposal-revised-proposal-draft-preparation', label: 'Revised Proposal Draft Preparation' },
  ]

  for (const item of proposalMatrix) {
    const dates = matchDatesForLabel(proposalSection, item.label, 2)
    if (dates.length !== 2) continue

    result[item.id] = dates[0]
    result[`${item.id}__t2`] = dates[1]
  }

  result['proposal-final-proposal-submission'] = ''
  result['proposal-final-proposal-submission__t2'] = ''

  const patentMatrix: Array<{ id: string; label: string }> = [
    {
      id: 'patent-title-finalization-with-bit-patent-office-approval',
      label: 'Title Finalization with BIT Patent Office Approval',
    },
    { id: 'patent-initial-patent-draft-preparation', label: 'Initial Patent Draft Preparation' },
    { id: 'patent-revised-patent-draft-preparation', label: 'Revised Patent Draft Preparation' },
    { id: 'patent-final-submission-of-patent-application', label: 'Final Submission of Patent Application' },
  ]

  for (const item of patentMatrix) {
    const dates = matchDatesForLabel(patentSection, item.label, 1)
    if (dates.length !== 1) continue
    result[item.id] = dates[0]
  }

  return result
}

class WorkflowTargetsService {
  private bootstrapPromise: Promise<void> | null = null
  private defaultDeadlineMapPromise: Promise<Record<string, string>> | null = null
  private adminComplianceCache = new Map<string, { expiresAt: number; value: AdminComplianceSummaryPayload }>()

  private mapAcademicYearConfig(row: WorkflowAcademicYearConfigRow): WorkflowAcademicYearConfig {
    const createdAt = new Date(row.created_at).toISOString()
    const updatedAt = new Date(row.updated_at).toISOString()
    const activatedAt = row.activated_at ? new Date(row.activated_at).toISOString() : null

    return {
      academicYear: row.academic_year,
      isActive: Number(row.is_active) === 1,
      paperSlots: Math.max(1, Math.trunc(Number(row.paper_slot_limit || DEFAULT_SLOT_LIMITS.paperSlots))),
      proposalSlots: Math.max(1, Math.trunc(Number(row.proposal_slot_limit || DEFAULT_SLOT_LIMITS.proposalSlots))),
      patentSlots: Math.max(0, Math.trunc(Number(row.patent_slot_limit || DEFAULT_SLOT_LIMITS.patentSlots))),
      createdAt,
      updatedAt,
      activatedAt,
    }
  }

  private async ensureAcademicYearExists(academicYear: string) {
    const pool = getMysqlPool()
    await pool.query<OkPacket>(
      `
        INSERT INTO workflow_academic_year_config (
          academic_year,
          is_active,
          paper_slot_limit,
          proposal_slot_limit,
          patent_slot_limit,
          activated_at
        )
        VALUES (?, 0, ?, ?, ?, NULL)
        ON DUPLICATE KEY UPDATE academic_year = VALUES(academic_year)
      `,
      [academicYear, DEFAULT_SLOT_LIMITS.paperSlots, DEFAULT_SLOT_LIMITS.proposalSlots, DEFAULT_SLOT_LIMITS.patentSlots],
    )
  }

  async getAcademicYearConfig(academicYear: string): Promise<WorkflowAcademicYearConfig> {
    await this.ensureSchema()
    await this.ensureAcademicYearExists(academicYear)

    const pool = getMysqlPool()
    const [rows] = await pool.query<WorkflowAcademicYearConfigRow[]>(
      `
        SELECT academic_year, is_active, paper_slot_limit, proposal_slot_limit, patent_slot_limit, created_at, updated_at, activated_at
        FROM workflow_academic_year_config
        WHERE academic_year = ?
        LIMIT 1
      `,
      [academicYear],
    )

    return this.mapAcademicYearConfig(rows[0])
  }

  async listAcademicYearConfigs(): Promise<WorkflowAcademicYearConfig[]> {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const [rows] = await pool.query<WorkflowAcademicYearConfigRow[]>(
      `
        SELECT academic_year, is_active, paper_slot_limit, proposal_slot_limit, patent_slot_limit, created_at, updated_at, activated_at
        FROM workflow_academic_year_config
        ORDER BY academic_year DESC
      `,
    )

    return rows.map((row) => this.mapAcademicYearConfig(row))
  }

  async createAcademicYearConfig(input: { academicYear: string; copyFromAcademicYear?: string | null }): Promise<WorkflowAcademicYearConfig> {
    await this.ensureSchema()

    const pool = getMysqlPool()
    const sourceYear = String(input.copyFromAcademicYear || '').trim()
    let paperSlots = DEFAULT_SLOT_LIMITS.paperSlots
    let proposalSlots = DEFAULT_SLOT_LIMITS.proposalSlots
    let patentSlots = DEFAULT_SLOT_LIMITS.patentSlots

    if (sourceYear) {
      const [sourceRows] = await pool.query<WorkflowAcademicYearConfigRow[]>(
        `
          SELECT academic_year, is_active, paper_slot_limit, proposal_slot_limit, patent_slot_limit, created_at, updated_at, activated_at
          FROM workflow_academic_year_config
          WHERE academic_year = ?
          LIMIT 1
        `,
        [sourceYear],
      )

      const source = sourceRows[0]
      if (source) {
        paperSlots = Math.max(1, Math.trunc(Number(source.paper_slot_limit || paperSlots)))
        proposalSlots = Math.max(1, Math.trunc(Number(source.proposal_slot_limit || proposalSlots)))
        patentSlots = Math.max(0, Math.trunc(Number(source.patent_slot_limit || patentSlots)))
      }
    }

    await pool.query<OkPacket>(
      `
        INSERT INTO workflow_academic_year_config (
          academic_year,
          is_active,
          paper_slot_limit,
          proposal_slot_limit,
          patent_slot_limit,
          activated_at
        )
        VALUES (?, 0, ?, ?, ?, NULL)
        ON DUPLICATE KEY UPDATE
          paper_slot_limit = VALUES(paper_slot_limit),
          proposal_slot_limit = VALUES(proposal_slot_limit),
          patent_slot_limit = VALUES(patent_slot_limit)
      `,
      [input.academicYear, paperSlots, proposalSlots, patentSlots],
    )

    return this.getAcademicYearConfig(input.academicYear)
  }

  async updateAcademicYearSlotLimits(input: {
    academicYear: string
    paperSlots: number
    proposalSlots: number
    patentSlots: number
  }): Promise<WorkflowAcademicYearConfig> {
    await this.ensureSchema()
    await this.ensureAcademicYearExists(input.academicYear)

    const paperSlots = Math.max(1, Math.min(12, Math.trunc(Number(input.paperSlots || DEFAULT_SLOT_LIMITS.paperSlots))))
    const proposalSlots = Math.max(1, Math.min(8, Math.trunc(Number(input.proposalSlots || DEFAULT_SLOT_LIMITS.proposalSlots))))
    const patentSlots = Math.max(0, Math.min(4, Math.trunc(Number(input.patentSlots ?? DEFAULT_SLOT_LIMITS.patentSlots))))

    const pool = getMysqlPool()
    await pool.query<OkPacket>(
      `
        UPDATE workflow_academic_year_config
        SET paper_slot_limit = ?, proposal_slot_limit = ?, patent_slot_limit = ?
        WHERE academic_year = ?
      `,
      [paperSlots, proposalSlots, patentSlots, input.academicYear],
    )

    return this.getAcademicYearConfig(input.academicYear)
  }

  async activateAcademicYear(academicYear: string): Promise<WorkflowAcademicYearConfig> {
    await this.ensureSchema()
    await this.ensureAcademicYearExists(academicYear)

    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()
      await connection.query<OkPacket>(
        `UPDATE workflow_academic_year_config SET is_active = 0 WHERE is_active = 1`,
      )
      await connection.query<OkPacket>(
        `
          UPDATE workflow_academic_year_config
          SET is_active = 1, activated_at = NOW()
          WHERE academic_year = ?
        `,
        [academicYear],
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return this.getAcademicYearConfig(academicYear)
  }

  async getActiveAcademicYearConfig(): Promise<WorkflowAcademicYearConfig> {
    await this.ensureSchema()

    const pool = getMysqlPool()
    const [rows] = await pool.query<WorkflowAcademicYearConfigRow[]>(
      `
        SELECT academic_year, is_active, paper_slot_limit, proposal_slot_limit, patent_slot_limit, created_at, updated_at, activated_at
        FROM workflow_academic_year_config
        WHERE is_active = 1
        ORDER BY updated_at DESC
        LIMIT 1
      `,
    )

    const active = rows[0]
    if (active) {
      return this.mapAcademicYearConfig(active)
    }

    await this.ensureAcademicYearExists(DEFAULT_ACADEMIC_YEAR)
    return this.activateAcademicYear(DEFAULT_ACADEMIC_YEAR)
  }

  async resolveAcademicYearOrDefault(inputAcademicYear?: string | null): Promise<string> {
    const normalized = String(inputAcademicYear || '').trim()
    if (normalized) {
      return normalized
    }

    const active = await this.getActiveAcademicYearConfig()
    return active.academicYear
  }

  async getComplianceLastUpdate(academicYear: string) {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const [rows] = await pool.query<ComplianceLastUpdatedRow[]>(
      `
        SELECT MAX(completed_at) AS last_updated
        FROM faculty_workflow_task_status
        WHERE academic_year = ?
          AND status = 'completed'
      `,
      [academicYear],
    )

    const value = rows[0]?.last_updated
    if (!value) return 0

    const timestamp = new Date(value).getTime()
    return Number.isFinite(timestamp) ? timestamp : 0
  }

  private async getDefaultWorkflowDeadlineMap() {
    if (this.defaultDeadlineMapPromise) {
      return this.defaultDeadlineMapPromise
    }

    this.defaultDeadlineMapPromise = (async () => {
      const candidates = [
        path.resolve(process.cwd(), 'assets', '.docx_extract', 'ddp_doc_text.txt'),
        path.resolve(process.cwd(), '..', 'assets', '.docx_extract', 'ddp_doc_text.txt'),
      ]

      for (const candidate of candidates) {
        try {
          const text = await readFile(candidate, 'utf8')
          const parsed = buildDeadlineMapFromDocText(text)
          const merged = {
            ...STATIC_FALLBACK_WORKFLOW_DEADLINE_MAP,
            ...parsed,
          }
          return merged
        } catch {
          // Try next path candidate.
        }
      }

      return { ...STATIC_FALLBACK_WORKFLOW_DEADLINE_MAP }
    })()

    return this.defaultDeadlineMapPromise
  }

  private async resolveCanonicalFacultyId(facultyId: string, facultyEmail?: string) {
    const normalizedId = String(facultyId || '').trim()
    const normalizedEmail = String(facultyEmail || '').trim()

    if (!normalizedId && !normalizedEmail) {
      return null
    }

    const pool = getMysqlPool()
    const [rows] = await pool.query<RowDataPacket[]>(
      `
        SELECT id
        FROM faculty
        WHERE (? <> '' AND (id = ? OR UPPER(TRIM(id)) = UPPER(TRIM(?))))
           OR (? <> '' AND LOWER(TRIM(email)) = LOWER(TRIM(?)))
        ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, id
        LIMIT 1
      `,
      [normalizedId, normalizedId, normalizedId, normalizedEmail, normalizedEmail, normalizedId],
    )

    return (rows[0]?.id as string | undefined) || (normalizedId || null)
  }

  private async getResolvedDesignationIdForFaculty(facultyId: string) {
    const normalizedFacultyId = String(facultyId || '').trim()
    if (!normalizedFacultyId) {
      return null
    }

    const pool = getMysqlPool()
    const [rows] = await pool.query<FacultyResolvedDesignationRow[]>(
      `
        SELECT ${FACULTY_RESOLVED_DESIGNATION_ID_SQL} AS designation_id
        FROM faculty f
        LEFT JOIN designation d_name
          ON UPPER(TRIM(d_name.designation_name)) = UPPER(TRIM(f.designation_id))
        WHERE (f.id = ? OR UPPER(TRIM(f.id)) = UPPER(TRIM(?)))
        LIMIT 1
      `,
      [normalizedFacultyId, normalizedFacultyId],
    )

    const designationId = Number(rows[0]?.designation_id)
    return Number.isFinite(designationId) && designationId > 0 ? designationId : null
  }

  private async syncAssignmentsForFaculty(input: { academicYear: string; facultyId: string }) {
    const normalizedFacultyId = String(input.facultyId || '').trim()
    if (!normalizedFacultyId) {
      return
    }

    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(input.academicYear)

    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      await connection.query<OkPacket>(
        `
          DELETE FROM faculty_fap_target_assignment
          WHERE academic_year = ?
            AND (faculty_id = ? OR UPPER(TRIM(faculty_id)) = UPPER(TRIM(?)))
        `,
        [input.academicYear, normalizedFacultyId, normalizedFacultyId],
      )

      await connection.query<OkPacket>(
        `
          INSERT INTO faculty_fap_target_assignment (
            academic_year,
            faculty_id,
            designation_id,
            target_id,
            assigned_value,
            assigned_on
          )
          SELECT
            r.academic_year,
            f.id,
            r.designation_id,
            r.target_id,
            r.target_value,
            CURDATE()
          FROM faculty f
          LEFT JOIN designation d_name
            ON UPPER(TRIM(d_name.designation_name)) = UPPER(TRIM(f.designation_id))
          JOIN fap_designation_target_rule r
            ON r.designation_id = ${FACULTY_RESOLVED_DESIGNATION_ID_SQL}
           AND r.academic_year = ?
          WHERE (f.id = ? OR UPPER(TRIM(f.id)) = UPPER(TRIM(?)))
            AND ${FACULTY_RESOLVED_DESIGNATION_ID_SQL} IS NOT NULL
          ON DUPLICATE KEY UPDATE
            designation_id = VALUES(designation_id),
            assigned_value = VALUES(assigned_value),
            assigned_on = VALUES(assigned_on),
            updated_at = CURRENT_TIMESTAMP
        `,
        [input.academicYear, normalizedFacultyId, normalizedFacultyId],
      )

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  private async ensureSchema() {
    if (this.bootstrapPromise) {
      await this.bootstrapPromise
      return
    }

    this.bootstrapPromise = (async () => {
      const pool = getMysqlPool()

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS workflow_deadline_settings (
          academic_year VARCHAR(20) NOT NULL,
          settings_json JSON NOT NULL,
          updated_by INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (academic_year),
          CONSTRAINT fk_workflow_deadline_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      await pool.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `)

      for (const target of TARGETS) {
        await pool.query<OkPacket>(
          `
            INSERT INTO fap_target_master (target_code, target_name, unit, is_active)
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
              target_name = VALUES(target_name),
              unit = VALUES(unit),
              is_active = VALUES(is_active)
          `,
          [target.code, target.name, target.unit],
        )
      }

      await pool.query<OkPacket>(
        `
          INSERT INTO workflow_academic_year_config (
            academic_year,
            is_active,
            paper_slot_limit,
            proposal_slot_limit,
            patent_slot_limit,
            activated_at
          )
          VALUES (?, 1, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE academic_year = VALUES(academic_year)
        `,
        [DEFAULT_ACADEMIC_YEAR, DEFAULT_SLOT_LIMITS.paperSlots, DEFAULT_SLOT_LIMITS.proposalSlots, DEFAULT_SLOT_LIMITS.patentSlots],
      )

      await pool.query(
        `
          UPDATE workflow_academic_year_config c
          JOIN (
            SELECT academic_year
            FROM workflow_academic_year_config
            ORDER BY is_active DESC, updated_at DESC, academic_year DESC
            LIMIT 1
          ) pick ON pick.academic_year = c.academic_year
          SET c.is_active = 1,
              c.activated_at = COALESCE(c.activated_at, NOW())
        `,
      )
    })()

    await this.bootstrapPromise
  }

  private async ensureTaskDefinitionsForAcademicYear(academicYear: string) {
    await this.ensureSchema()

    const pool = getMysqlPool()
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM workflow_task_definition WHERE academic_year = ? LIMIT 1`,
      [academicYear],
    )

    if (existing.length > 0) {
      return false
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      let sourceAcademicYear = DEFAULT_ACADEMIC_YEAR

      const [defaultSourceRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT academic_year
          FROM workflow_task_definition
          WHERE academic_year = ?
          LIMIT 1
        `,
        [DEFAULT_ACADEMIC_YEAR],
      )

      if (!defaultSourceRows[0]) {
        const [latestSourceRows] = await connection.query<RowDataPacket[]>(
          `
            SELECT academic_year
            FROM workflow_task_definition
            GROUP BY academic_year
            ORDER BY academic_year DESC
            LIMIT 1
          `,
        )

        sourceAcademicYear = String(latestSourceRows[0]?.academic_year || '').trim()
      }

      if (sourceAcademicYear && sourceAcademicYear !== academicYear) {
        await connection.query<OkPacket>(
          `
            INSERT INTO workflow_task_definition (academic_year, workflow_type, sequence_no, base_id, title, is_active)
            SELECT ?, workflow_type, sequence_no, base_id, title, is_active
            FROM workflow_task_definition
            WHERE academic_year = ?
              AND is_active = 1
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              is_active = VALUES(is_active),
              updated_at = CURRENT_TIMESTAMP
          `,
          [academicYear, sourceAcademicYear],
        )
      }

      const [seededRows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM workflow_task_definition WHERE academic_year = ? LIMIT 1`,
        [academicYear],
      )

      await connection.commit()
      return seededRows.length > 0
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  private async getWorkflowTasks(academicYear: string) {
    await this.ensureTaskDefinitionsForAcademicYear(academicYear)

    const pool = getMysqlPool()
    const [rows] = await pool.query<WorkflowTaskDefinitionRow[]>(
      `
        SELECT workflow_type, sequence_no, base_id, title
        FROM workflow_task_definition
        WHERE academic_year = ?
          AND is_active = 1
        ORDER BY workflow_type, sequence_no
      `,
      [academicYear],
    )

    if (rows.length === 0) {
      return {
        paper: [],
        proposal: [],
        patent: [],
      }
    }

    const result: {
      paper: Array<{ baseId: string; title: string }>
      proposal: Array<{ baseId: string; title: string }>
      patent: Array<{ baseId: string; title: string }>
    } = {
      paper: [],
      proposal: [],
      patent: [],
    }

    for (const row of rows) {
      result[row.workflow_type].push({
        baseId: row.base_id,
        title: row.title,
      })
    }

    return result
  }

  private async getDeadlineSettings(academicYear: string) {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const defaultDeadlineMap = await this.getDefaultWorkflowDeadlineMap()
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT settings_json FROM workflow_deadline_settings WHERE academic_year = ? LIMIT 1`,
      [academicYear],
    )

    const stored = rows[0]?.settings_json as Record<string, string> | undefined
    return {
      ...defaultDeadlineMap,
      ...(stored || {}),
    }
  }

  async getDeadlineSettingsForAcademicYear(academicYear: string) {
    return this.getDeadlineSettings(academicYear)
  }

  async saveDeadlineSettings(input: { academicYear: string; settings: Record<string, string>; updatedBy?: number | null }) {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const defaultDeadlineMap = await this.getDefaultWorkflowDeadlineMap()
    const merged = {
      ...defaultDeadlineMap,
      ...(input.settings || {}),
    }

    await pool.query<OkPacket>(
      `
        INSERT INTO workflow_deadline_settings (academic_year, settings_json, updated_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          settings_json = VALUES(settings_json),
          updated_by = VALUES(updated_by)
      `,
      [input.academicYear, JSON.stringify(merged), input.updatedBy || null],
    )

    return merged
  }

  private async getTargetMasterMap() {
    const pool = getMysqlPool()
    const [rows] = await pool.query<TargetMasterRow[]>(
      `SELECT id, target_code, target_name, unit FROM fap_target_master WHERE is_active = 1 ORDER BY id`,
    )

    return new Map(rows.map((row) => [row.target_code, row.id]))
  }

  async getTargetDefinitions(): Promise<WorkflowTargetDefinition[]> {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const [rows] = await pool.query<TargetMasterRow[]>(
      `SELECT id, target_code, target_name, unit FROM fap_target_master WHERE is_active = 1 ORDER BY id`,
    )

    return rows.map((row) => ({
      code: row.target_code,
      name: row.target_name,
      unit: row.unit,
    }))
  }

  async seedDefaultsForAcademicYear(academicYear: string = DEFAULT_ACADEMIC_YEAR) {
    await this.ensureSchema()
    await this.ensureTaskDefinitionsForAcademicYear(academicYear)

    const pool = getMysqlPool()
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM fap_designation_target_rule WHERE academic_year = ? LIMIT 1`,
      [academicYear],
    )

    if (existing.length > 0) {
      return false
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      let sourceAcademicYear = DEFAULT_ACADEMIC_YEAR

      const [defaultSourceRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT academic_year
          FROM fap_designation_target_rule
          WHERE academic_year = ?
          LIMIT 1
        `,
        [DEFAULT_ACADEMIC_YEAR],
      )

      if (!defaultSourceRows[0]) {
        const [latestSourceRows] = await connection.query<RowDataPacket[]>(
          `
            SELECT academic_year
            FROM fap_designation_target_rule
            GROUP BY academic_year
            ORDER BY academic_year DESC
            LIMIT 1
          `,
        )

        sourceAcademicYear = String(latestSourceRows[0]?.academic_year || '').trim()
      }

      if (sourceAcademicYear && sourceAcademicYear !== academicYear) {
        await connection.query<OkPacket>(
          `
            INSERT INTO fap_designation_target_rule (academic_year, designation_id, target_id, target_value)
            SELECT ?, designation_id, target_id, target_value
            FROM fap_designation_target_rule
            WHERE academic_year = ?
            ON DUPLICATE KEY UPDATE
              target_value = VALUES(target_value),
              updated_at = CURRENT_TIMESTAMP
          `,
          [academicYear, sourceAcademicYear],
        )
      }

      await connection.query<OkPacket>(
        `
          INSERT INTO fap_designation_target_rule (academic_year, designation_id, target_id, target_value)
          SELECT ?, d.id, tm.id, 0
          FROM designation d
          CROSS JOIN fap_target_master tm
          LEFT JOIN fap_designation_target_rule r
            ON r.academic_year = ?
           AND r.designation_id = d.id
           AND r.target_id = tm.id
          WHERE tm.is_active = 1
            AND r.id IS NULL
          ON DUPLICATE KEY UPDATE
            target_value = VALUES(target_value),
            updated_at = CURRENT_TIMESTAMP
        `,
        [academicYear, academicYear],
      )

      const [seededRows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM fap_designation_target_rule WHERE academic_year = ? LIMIT 1`,
        [academicYear],
      )

      await connection.commit()
      return seededRows.length > 0
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async getDesignationRules(academicYear: string = DEFAULT_ACADEMIC_YEAR): Promise<DesignationTargetRule[]> {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(academicYear)

    const pool = getMysqlPool()
    const [ruleRows] = await pool.query<RuleRow[]>(
      `
        SELECT
          d.id AS designation_id,
          d.designation_name,
          tm.target_code,
          r.target_value
        FROM designation d
        CROSS JOIN fap_target_master tm
        LEFT JOIN fap_designation_target_rule r
          ON r.designation_id = d.id
         AND r.target_id = tm.id
         AND r.academic_year = ?
        WHERE tm.is_active = 1
        ORDER BY d.id, tm.id
      `,
      [academicYear],
    )

    const [facultyCounts] = await pool.query<FacultyCountRow[]>(
      `
        SELECT
          ${FACULTY_RESOLVED_DESIGNATION_ID_SQL} AS designation_id,
          COUNT(*) AS faculty_count
        FROM faculty f
        LEFT JOIN designation d_name
          ON UPPER(TRIM(d_name.designation_name)) = UPPER(TRIM(f.designation_id))
        WHERE ${FACULTY_RESOLVED_DESIGNATION_ID_SQL} IS NOT NULL
        GROUP BY ${FACULTY_RESOLVED_DESIGNATION_ID_SQL}
      `,
    )

    const facultyCountByDesignation = new Map(facultyCounts.map((row) => [row.designation_id, Number(row.faculty_count || 0)]))
    const grouped = new Map<number, DesignationTargetRule>()

    for (const row of ruleRows) {
      const current = grouped.get(row.designation_id)
      if (!current) {
        grouped.set(row.designation_id, {
          designationId: row.designation_id,
          designationName: row.designation_name,
          facultyCount: facultyCountByDesignation.get(row.designation_id) || 0,
          academicYear,
          targets: {
            [row.target_code]: Number(row.target_value || 0),
          },
        })
        continue
      }

      current.targets[row.target_code] = Number(row.target_value || 0)
    }

    return Array.from(grouped.values())
  }

  async upsertDesignationTargets(input: {
    academicYear: string
    designationId: number
    targets: Record<string, number>
  }) {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(input.academicYear)

    const targetMap = await this.getTargetMasterMap()
    const entries = Object.entries(input.targets)
      .filter(([_, value]) => Number.isFinite(value) && value >= 0)
      .map(([key, value]) => [key as TargetCode, Number(value)] as const)

    if (entries.length === 0) {
      throw new Error('At least one valid target value is required')
    }

    const invalidKeys = entries
      .map(([code]) => code)
      .filter((code) => !targetMap.has(code))

    if (invalidKeys.length > 0) {
      throw new Error(`Invalid target code(s): ${invalidKeys.join(', ')}`)
    }

    const academicYearConfig = await this.getAcademicYearConfig(input.academicYear)
    const targetLimitByCode: Partial<Record<TargetCode, number>> = {
      paper_target_count: academicYearConfig.paperSlots,
      funding_proposal_slot_count: academicYearConfig.proposalSlots,
      patent_count: academicYearConfig.patentSlots,
    }

    const overLimitEntries = entries
      .filter(([code, value]) => {
        const max = targetLimitByCode[code]
        return Number.isFinite(max) && value > Number(max)
      })
      .map(([code, value]) => {
        const max = targetLimitByCode[code]
        return `${code} (${value} > ${max})`
      })

    if (overLimitEntries.length > 0) {
      throw new Error(`Target value exceeds allowed workflow slot limit: ${overLimitEntries.join(', ')}`)
    }

    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      for (const [code, value] of entries) {
        const targetId = targetMap.get(code)
        if (!targetId) continue

        await connection.query<OkPacket>(
          `
            INSERT INTO fap_designation_target_rule (academic_year, designation_id, target_id, target_value)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE target_value = VALUES(target_value)
          `,
          [input.academicYear, input.designationId, targetId, value],
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return this.getDesignationRules(input.academicYear)
  }

  async rebuildAssignments(input: { academicYear: string; designationId?: number }) {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(input.academicYear)

    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      if (input.designationId) {
        await connection.query<OkPacket>(
          `
            DELETE FROM faculty_fap_target_assignment
            WHERE academic_year = ?
              AND designation_id = ?
          `,
          [input.academicYear, input.designationId],
        )
      } else {
        await connection.query<OkPacket>(
          `DELETE FROM faculty_fap_target_assignment WHERE academic_year = ?`,
          [input.academicYear],
        )
      }

      const params: unknown[] = [input.academicYear]
      if (input.designationId) {
        params.push(input.designationId)
      }

      await connection.query<OkPacket>(
        `
          INSERT INTO faculty_fap_target_assignment (
            academic_year,
            faculty_id,
            designation_id,
            target_id,
            assigned_value,
            assigned_on
          )
          SELECT
            r.academic_year,
            f.id,
            r.designation_id,
            r.target_id,
            r.target_value,
            CURDATE()
          FROM faculty f
          LEFT JOIN designation d_name
            ON UPPER(TRIM(d_name.designation_name)) = UPPER(TRIM(f.designation_id))
          JOIN fap_designation_target_rule r
            ON r.designation_id = ${FACULTY_RESOLVED_DESIGNATION_ID_SQL}
           AND r.academic_year = ?
          WHERE ${FACULTY_RESOLVED_DESIGNATION_ID_SQL} IS NOT NULL
          ${input.designationId ? 'AND r.designation_id = ?' : ''}
          ON DUPLICATE KEY UPDATE
            designation_id = VALUES(designation_id),
            assigned_value = VALUES(assigned_value),
            assigned_on = VALUES(assigned_on),
            updated_at = CURRENT_TIMESTAMP
        `,
        params,
      )

      const [countRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS count
          FROM faculty_fap_target_assignment
          WHERE academic_year = ?
        `,
        [input.academicYear],
      )

      await connection.commit()
      return Number(countRows[0]?.count || 0)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async getFacultyTargets(academicYear: string, facultyId: string): Promise<FacultyTargetSummary | null> {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(academicYear)

    const pool = getMysqlPool()
    const [rows] = await pool.query<FacultyAssignmentRow[]>(
      `
        SELECT
          a.faculty_id,
          a.designation_id,
          d.designation_name,
          tm.target_code,
          a.assigned_value
        FROM faculty_fap_target_assignment a
        JOIN designation d ON d.id = a.designation_id
        JOIN fap_target_master tm ON tm.id = a.target_id
        WHERE a.academic_year = ?
          AND (a.faculty_id = ? OR UPPER(TRIM(a.faculty_id)) = UPPER(TRIM(?)))
        ORDER BY tm.id
      `,
      [academicYear, facultyId, facultyId],
    )

    if (rows.length === 0) {
      return null
    }

    const summary: FacultyTargetSummary = {
      facultyId,
      designationId: rows[0].designation_id,
      designationName: rows[0].designation_name,
      academicYear,
      targets: {},
    }

    for (const row of rows) {
      summary.targets[row.target_code] = Number(row.assigned_value || 0)
    }

    return summary
  }

  async getWorkflowPlanForFaculty(input: { academicYear: string; facultyId: string; facultyEmail?: string }): Promise<WorkflowPlanPayload | null> {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(input.academicYear)

    const canonicalFacultyId = await this.resolveCanonicalFacultyId(input.facultyId, input.facultyEmail)
    const effectiveFacultyId = canonicalFacultyId || input.facultyId
    const resolvedDesignationId = await this.getResolvedDesignationIdForFaculty(effectiveFacultyId)

    let targetSummary = await this.getFacultyTargets(input.academicYear, effectiveFacultyId)

    const hasDesignationMismatch = Boolean(
      targetSummary
      && resolvedDesignationId
      && Number(targetSummary.designationId) !== Number(resolvedDesignationId),
    )

    if (!targetSummary || hasDesignationMismatch) {
      await this.syncAssignmentsForFaculty({
        academicYear: input.academicYear,
        facultyId: effectiveFacultyId,
      })
      targetSummary = await this.getFacultyTargets(input.academicYear, effectiveFacultyId)
    }

    if (!targetSummary) {
      const rules = await this.getDesignationRules(input.academicYear)
      const fallbackRule = rules.find((rule) => normalizeDesignationName(rule.designationName) === 'ASSISTANT PROFESSOR LEVEL I')
        || rules[0]

      if (!fallbackRule) {
        return null
      }

      targetSummary = {
        facultyId: effectiveFacultyId,
        designationId: fallbackRule.designationId,
        designationName: fallbackRule.designationName,
        academicYear: input.academicYear,
        targets: { ...fallbackRule.targets },
      }
    }

    const deadlineMap = await this.getDeadlineSettings(input.academicYear)
    const workflowTasks = await this.getWorkflowTasks(input.academicYear)
    const academicYearConfig = await this.getAcademicYearConfig(input.academicYear)
    const paperTargets = Math.max(1, Math.min(academicYearConfig.paperSlots, Math.trunc(targetSummary.targets.paper_target_count || 1)))
    const proposalSlots = Math.max(1, Math.min(academicYearConfig.proposalSlots, Math.trunc(targetSummary.targets.funding_proposal_slot_count || 1)))
    const patentSlots = Math.max(0, Math.min(academicYearConfig.patentSlots, Math.trunc(targetSummary.targets.patent_count || 0)))
    const patentEnabled = patentSlots > 0

    const tasks: WorkflowTaskPayload[] = []

    for (let slot = 1; slot <= paperTargets; slot += 1) {
      for (const task of workflowTasks.paper) {
        const id = buildTaskId(task.baseId, slot)
        tasks.push({
          id,
          baseId: task.baseId,
          title: task.title,
          type: 'paper',
          slotNo: slot,
          deadlineISO: deadlineMap[id] || deadlineMap[task.baseId] || '',
          completed: false,
        })
      }
    }

    for (let slot = 1; slot <= proposalSlots; slot += 1) {
      for (const task of workflowTasks.proposal) {
        const id = buildTaskId(task.baseId, slot)
        tasks.push({
          id,
          baseId: task.baseId,
          title: task.title,
          type: 'proposal',
          slotNo: slot,
          deadlineISO: deadlineMap[id] || deadlineMap[task.baseId] || '',
          completed: false,
        })
      }
    }

    if (patentEnabled) {
      for (let slot = 1; slot <= patentSlots; slot += 1) {
        for (const task of workflowTasks.patent) {
          const id = buildTaskId(task.baseId, slot)
          tasks.push({
            id,
            baseId: task.baseId,
            title: task.title,
            type: 'patent',
            slotNo: slot,
            deadlineISO: deadlineMap[id] || deadlineMap[task.baseId] || '',
            completed: false,
          })
        }
      }
    }

    const pool = getMysqlPool()
    const [statusRows] = await pool.query<WorkflowTaskStatusRow[]>(
      `
        SELECT workflow_type, slot_no, task_code
        FROM faculty_workflow_task_status
        WHERE academic_year = ?
          AND (faculty_id = ? OR UPPER(TRIM(faculty_id)) = UPPER(TRIM(?)))
          AND status = 'completed'
      `,
      [input.academicYear, effectiveFacultyId, effectiveFacultyId],
    )

    const completedSet = new Set(
      statusRows.map((row) => buildTaskId(row.task_code, Number(row.slot_no || 1))),
    )

    for (const task of tasks) {
      task.completed = completedSet.has(task.id)
    }

    return {
      academicYear: input.academicYear,
      paperTargets,
      proposalSlots,
      patentEnabled,
      deadlineMap,
      completedTaskIds: Array.from(completedSet),
      tasks,
    }
  }

  async completeWorkflowTask(input: {
    academicYear: string
    facultyId: string
    facultyEmail?: string
    workflowType: 'paper' | 'patent' | 'proposal'
    slotNo: number
    taskCode: string
    payload?: Record<string, unknown>
  }) {
    await this.ensureSchema()
    const pool = getMysqlPool()
    const canonicalFacultyId = await this.resolveCanonicalFacultyId(input.facultyId, input.facultyEmail)
    const effectiveFacultyId = canonicalFacultyId || input.facultyId

    await pool.query<OkPacket>(
      `
        INSERT INTO faculty_workflow_task_status (
          academic_year,
          faculty_id,
          workflow_type,
          slot_no,
          task_code,
          status,
          payload_json,
          completed_at
        )
        VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())
        ON DUPLICATE KEY UPDATE
          status = 'completed',
          payload_json = VALUES(payload_json),
          completed_at = NOW()
      `,
      [
        input.academicYear,
        effectiveFacultyId,
        input.workflowType,
        Math.max(1, Math.trunc(input.slotNo || 1)),
        input.taskCode,
        input.payload ? JSON.stringify(input.payload) : null,
      ],
    )

    // Mutation invalidates cached admin compliance snapshots.
    this.adminComplianceCache.clear()
  }

  async getAdminComplianceSummary(input: {
    academicYear: string
    page?: number
    pageSize?: number
    fetchAll?: boolean
    search?: string
    department?: string
    designation?: string
  }): Promise<AdminComplianceSummaryPayload> {
    await this.ensureSchema()
    await this.seedDefaultsForAcademicYear(input.academicYear)

    const page = Math.max(1, Math.trunc(Number(input.page || 1)))
    const pageSize = Math.max(5, Math.min(2000, Math.trunc(Number(input.pageSize || 500))))
    const fetchAll = Boolean(input.fetchAll)
    const search = String(input.search || '').trim()
    const department = String(input.department || '').trim()
    const designation = String(input.designation || '').trim()

    const cacheKey = JSON.stringify({
      academicYear: input.academicYear,
      page,
      pageSize,
      fetchAll,
      search,
      department,
      designation,
    })

    const cached = this.adminComplianceCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value
    }

    const pool = getMysqlPool()
    const whereParts: string[] = []
    const whereValues: unknown[] = []

    if (search) {
      whereParts.push(`(f.id LIKE ? OR f.name LIKE ? OR f.email LIKE ?)`)
      const like = `%${search}%`
      whereValues.push(like, like, like)
    }

    if (department) {
      whereParts.push(`d.dept_code = ?`)
      whereValues.push(department)
    }

    if (designation) {
      whereParts.push(`des.designation_name = ?`)
      whereValues.push(designation)
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    const [countRows] = await pool.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM faculty f
        LEFT JOIN departments d ON d.id = f.department_id
        LEFT JOIN designation des ON des.id = CAST(f.designation_id AS UNSIGNED)
        ${whereSql}
      `,
      whereValues,
    )

    const total = Number(countRows[0]?.total || 0)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = fetchAll ? 1 : Math.min(page, totalPages)
    const offset = fetchAll ? 0 : (safePage - 1) * pageSize
    const effectiveLimit = fetchAll ? Math.max(total, 1) : pageSize

    const [facultyRows] = await pool.query<FacultyDirectoryRow[]>(
      `
        SELECT
          f.id AS faculty_id,
          TRIM(f.name) AS name,
          TRIM(f.email) AS email,
          d.dept_code AS department,
          des.designation_name AS designation
        FROM faculty f
        LEFT JOIN departments d ON d.id = f.department_id
        LEFT JOIN designation des ON des.id = CAST(f.designation_id AS UNSIGNED)
        ${whereSql}
        ORDER BY f.id
        LIMIT ? OFFSET ?
      `,
      [...whereValues, effectiveLimit, offset],
    )

    const plans = await Promise.all(
      facultyRows.map(async (faculty) => {
        try {
          const plan = await this.getWorkflowPlanForFaculty({
            academicYear: input.academicYear,
            facultyId: faculty.faculty_id,
            facultyEmail: faculty.email || undefined,
          })
          return { faculty, plan }
        } catch {
          return { faculty, plan: null }
        }
      }),
    )

    const rows: AdminFacultyComplianceRow[] = []
    const taskAccumulator = new Map<string, AdminComplianceTaskAccumulator>()

    for (const entry of plans) {
      const planTasks = entry.plan?.tasks || []
      const completedTasks = planTasks.filter((task) => task.completed).length
      const pendingTasks = Math.max(0, planTasks.length - completedTasks)
      const completionRate = planTasks.length === 0 ? 0 : Math.round((completedTasks / planTasks.length) * 100)
      const completedTaskIds = planTasks
        .filter((task) => task.completed)
        .map((task) => buildTaskId(task.baseId, task.slotNo))

      rows.push({
        facultyId: entry.faculty.faculty_id,
        name: entry.faculty.name || entry.faculty.faculty_id,
        email: entry.faculty.email || '',
        department: entry.faculty.department || 'N/A',
        designation: entry.faculty.designation || 'N/A',
        completedTasks,
        pendingTasks,
        completionRate,
        completedTaskIds,
      })

      for (const task of planTasks) {
        const key = buildTaskId(task.baseId, task.slotNo)
        const existing = taskAccumulator.get(key)

        if (!existing) {
          taskAccumulator.set(key, {
            key,
            task: task.title,
            workflow: getWorkflowLabel(task.type),
            type: task.type,
            targetIndex: task.slotNo,
            deadlineISO: task.deadlineISO,
            totalFaculty: 1,
            completedFaculty: task.completed ? 1 : 0,
          })
          continue
        }

        existing.totalFaculty += 1
        existing.completedFaculty += task.completed ? 1 : 0
        if (!existing.deadlineISO && task.deadlineISO) {
          existing.deadlineISO = task.deadlineISO
        }
      }
    }

    const tasks: AdminTaskComplianceRow[] = Array.from(taskAccumulator.values())
      .map((item) => {
        const pendingFaculty = Math.max(0, item.totalFaculty - item.completedFaculty)
        const completionRate = item.totalFaculty === 0 ? 0 : Math.round((item.completedFaculty / item.totalFaculty) * 100)

        return {
          key: item.key,
          task: item.task,
          workflow: item.workflow,
          type: item.type,
          targetIndex: item.targetIndex,
          deadlineISO: item.deadlineISO,
          completionRate,
          completedFaculty: item.completedFaculty,
          pendingFaculty,
          statusLabel: getDeadlineStatusLabel(item.deadlineISO),
        }
      })
      .sort((a, b) => a.workflow.localeCompare(b.workflow) || a.task.localeCompare(b.task) || a.targetIndex - b.targetIndex)

    const payload: AdminComplianceSummaryPayload = {
      rows,
      tasks,
      pagination: {
        page: safePage,
        pageSize: fetchAll ? Math.max(total, 1) : pageSize,
        total,
        totalPages,
      },
    }

    this.adminComplianceCache.set(cacheKey, {
      expiresAt: Date.now() + 5 * 1000,
      value: payload,
    })

    return payload
  }
}

export default new WorkflowTargetsService()
