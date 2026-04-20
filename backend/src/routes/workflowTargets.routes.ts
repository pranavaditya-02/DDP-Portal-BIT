import express from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth'
import workflowTargetsService from '../services/workflowTargets.service'
import { logger } from '../utils/logger'

const router = express.Router()

const academicYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}$/i, 'Academic year must be in YYYY-YY format')

const designationTargetUpdateSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  targets: z.record(z.number().min(0)).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one target value',
  }),
})

const rebuildSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  designationId: z.number().int().positive().optional(),
})

const deadlineSettingsSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  settings: z.record(z.string()).default({}),
})

const completeTaskSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  workflowType: z.enum(['paper', 'patent', 'proposal']),
  slotNo: z.number().int().positive().default(1),
  taskCode: z.string().trim().min(1),
  payload: z.record(z.any()).optional(),
})

const adminComplianceQuerySchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(2000).default(500),
  fetchAll: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
})

const awaitComplianceUpdateQuerySchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  since: z.coerce.number().int().nonnegative().default(0),
  timeoutMs: z.coerce.number().int().min(1000).max(60000).default(30000),
})

const createAcademicYearSchema = z.object({
  academicYear: academicYearSchema,
  copyFromAcademicYear: academicYearSchema.optional(),
})

const slotLimitsSchema = z.object({
  paperSlots: z.coerce.number().int().min(1).max(12),
  proposalSlots: z.coerce.number().int().min(1).max(8),
  patentSlots: z.coerce.number().int().min(0).max(4),
})

router.get('/active-academic-year', authenticateToken, async (_req: AuthRequest, res) => {
  try {
    const config = await workflowTargetsService.getActiveAcademicYearConfig()
    res.json(config)
  } catch (error) {
    logger.error('Error fetching active workflow academic year:', error)
    res.status(500).json({ error: 'Failed to fetch active workflow academic year' })
  }
})

router.get('/admin/academic-years', authenticateToken, requireRole('maintenance', 'admin'), async (_req, res) => {
  try {
    const years = await workflowTargetsService.listAcademicYearConfigs()
    const active = years.find((item) => item.isActive) || null
    res.json({ years, activeAcademicYear: active?.academicYear || null })
  } catch (error) {
    logger.error('Error fetching workflow academic year configs:', error)
    res.status(500).json({ error: 'Failed to fetch workflow academic year configs' })
  }
})

router.post('/admin/academic-years', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const payload = createAcademicYearSchema.parse(req.body)
    const config = await workflowTargetsService.createAcademicYearConfig({
      academicYear: payload.academicYear,
      copyFromAcademicYear: payload.copyFromAcademicYear || null,
    })

    res.json({
      message: 'Workflow academic year created successfully',
      config,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error creating workflow academic year:', error)
    res.status(500).json({ error: 'Failed to create workflow academic year' })
  }
})

router.put('/admin/academic-years/:academicYear/slots', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const parsedYear = academicYearSchema.safeParse(req.params.academicYear)
    if (!parsedYear.success) {
      return res.status(400).json({ error: parsedYear.error.errors })
    }

    const payload = slotLimitsSchema.parse(req.body)
    const config = await workflowTargetsService.updateAcademicYearSlotLimits({
      academicYear: parsedYear.data,
      paperSlots: payload.paperSlots,
      proposalSlots: payload.proposalSlots,
      patentSlots: payload.patentSlots,
    })

    res.json({
      message: 'Workflow slot limits updated successfully',
      config,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating workflow slot limits:', error)
    res.status(500).json({ error: 'Failed to update workflow slot limits' })
  }
})

router.post('/admin/academic-years/:academicYear/activate', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const parsedYear = academicYearSchema.safeParse(req.params.academicYear)
    if (!parsedYear.success) {
      return res.status(400).json({ error: parsedYear.error.errors })
    }

    const config = await workflowTargetsService.activateAcademicYear(parsedYear.data)
    res.json({
      message: 'Workflow academic year activated successfully',
      config,
    })
  } catch (error) {
    logger.error('Error activating workflow academic year:', error)
    res.status(500).json({ error: 'Failed to activate workflow academic year' })
  }
})

router.get('/designation-rules', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const rules = await workflowTargetsService.getDesignationRules(parsed.data)
    res.json({ academicYear: parsed.data, rules })
  } catch (error) {
    logger.error('Error fetching designation target rules:', error)
    res.status(500).json({ error: 'Failed to fetch designation target rules' })
  }
})

router.get('/target-master', authenticateToken, requireRole('maintenance', 'admin'), async (_req, res) => {
  try {
    const targets = await workflowTargetsService.getTargetDefinitions()
    res.json({ targets })
  } catch (error) {
    logger.error('Error fetching target master:', error)
    res.status(500).json({ error: 'Failed to fetch target master' })
  }
})

router.put('/designation-rules/:designationId', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const designationId = Number(req.params.designationId)
    if (!Number.isFinite(designationId) || designationId <= 0) {
      return res.status(400).json({ error: 'Invalid designation id' })
    }

    const payload = designationTargetUpdateSchema.parse(req.body)
    const rules = await workflowTargetsService.upsertDesignationTargets({
      academicYear: payload.academicYear,
      designationId,
      targets: payload.targets,
    })

    const assignmentCount = await workflowTargetsService.rebuildAssignments({
      academicYear: payload.academicYear,
      designationId,
    })

    res.json({
      message: 'Designation targets updated successfully and assignments rebuilt',
      academicYear: payload.academicYear,
      designationId,
      assignmentCount,
      rules,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating designation target rules:', error)
    res.status(500).json({ error: 'Failed to update designation target rules' })
  }
})

router.post('/assignments/rebuild', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const payload = rebuildSchema.parse(req.body)
    const count = await workflowTargetsService.rebuildAssignments(payload)

    res.json({
      message: 'Faculty target assignments rebuilt successfully',
      academicYear: payload.academicYear,
      designationId: payload.designationId || null,
      assignmentCount: count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error rebuilding faculty target assignments:', error)
    res.status(500).json({ error: 'Failed to rebuild faculty target assignments' })
  }
})

router.get('/faculty/:facultyId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const summary = await workflowTargetsService.getFacultyTargets(parsed.data, req.params.facultyId)
    if (!summary) {
      return res.status(404).json({ error: 'No target assignments found for faculty' })
    }

    res.json(summary)
  } catch (error) {
    logger.error('Error fetching faculty target assignments:', error)
    res.status(500).json({ error: 'Failed to fetch faculty target assignments' })
  }
})

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    const summary = await workflowTargetsService.getFacultyTargets(parsed.data, req.user.facultyId)
    if (!summary) {
      return res.status(404).json({ error: 'No target assignments found for current user' })
    }

    res.json(summary)
  } catch (error) {
    logger.error('Error fetching current user target assignments:', error)
    res.status(500).json({ error: 'Failed to fetch current user target assignments' })
  }
})

router.get('/admin/deadlines', authenticateToken, requireRole('maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const settings = await workflowTargetsService.getDeadlineSettingsForAcademicYear(parsed.data)
    res.json({ academicYear: parsed.data, settings })
  } catch (error) {
    logger.error('Error fetching workflow deadline settings:', error)
    res.status(500).json({ error: 'Failed to fetch workflow deadline settings' })
  }
})

router.get('/admin/compliance-summary', authenticateToken, requireRole('dean', 'maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const query = adminComplianceQuerySchema.parse(req.query)
    const summary = await workflowTargetsService.getAdminComplianceSummary({
      academicYear: query.academicYear,
      page: query.page,
      pageSize: query.pageSize,
      fetchAll: query.fetchAll,
      search: query.search,
      department: query.department,
      designation: query.designation,
    })

    res.json(summary)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error fetching admin compliance summary:', error)
    res.status(500).json({ error: 'Failed to fetch admin compliance summary' })
  }
})

router.get('/admin/compliance-summary/check-updates', authenticateToken, requireRole('dean', 'maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const lastUpdate = await workflowTargetsService.getComplianceLastUpdate(parsed.data)
    res.json({
      lastUpdate,
      timestamp: lastUpdate > 0 ? new Date(lastUpdate).toISOString() : null,
    })
  } catch (error) {
    logger.error('Error checking admin compliance updates:', error)
    res.status(500).json({ error: 'Failed to check admin compliance updates' })
  }
})

router.get('/admin/compliance-summary/await-update', authenticateToken, requireRole('dean', 'maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const query = awaitComplianceUpdateQuerySchema.parse(req.query)
    const deadline = Date.now() + query.timeoutMs
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    while (Date.now() < deadline) {
      const latest = await workflowTargetsService.getComplianceLastUpdate(query.academicYear)
      if (latest > query.since) {
        return res.json({
          changed: true,
          lastUpdate: latest,
          timestamp: new Date(latest).toISOString(),
        })
      }

      await sleep(1000)
    }

    res.json({
      changed: false,
      lastUpdate: query.since,
      timestamp: query.since > 0 ? new Date(query.since).toISOString() : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error awaiting admin compliance update:', error)
    res.status(500).json({ error: 'Failed while waiting for admin compliance update' })
  }
})

router.put('/admin/deadlines', authenticateToken, requireRole('maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const payload = deadlineSettingsSchema.parse(req.body)
    const settings = await workflowTargetsService.saveDeadlineSettings({
      academicYear: payload.academicYear,
      settings: payload.settings,
      updatedBy: req.user?.id || null,
    })

    res.json({
      message: 'Workflow deadline settings updated successfully',
      academicYear: payload.academicYear,
      settings,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating workflow deadline settings:', error)
    res.status(500).json({ error: 'Failed to update workflow deadline settings' })
  }
})

router.get('/me/workflow', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    const plan = await workflowTargetsService.getWorkflowPlanForFaculty({
      academicYear: parsed.data,
      facultyId: req.user.facultyId,
      facultyEmail: req.user.email,
    })

    if (!plan) {
      return res.status(404).json({ error: 'No workflow plan found for current user' })
    }

    res.json(plan)
  } catch (error) {
    logger.error('Error fetching current user workflow plan:', error)
    res.status(500).json({ error: 'Failed to fetch workflow plan' })
  }
})

router.get('/admin/faculty/:facultyId/workflow', authenticateToken, requireRole('dean', 'maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const facultyId = String(req.params.facultyId || '').trim()
    if (!facultyId) {
      return res.status(400).json({ error: 'Faculty id is required' })
    }

    const facultyEmail = typeof req.query.facultyEmail === 'string' ? req.query.facultyEmail : undefined

    const plan = await workflowTargetsService.getWorkflowPlanForFaculty({
      academicYear: parsed.data,
      facultyId,
      facultyEmail,
    })

    if (!plan) {
      return res.status(404).json({ error: 'No workflow plan found for faculty' })
    }

    res.json(plan)
  } catch (error) {
    logger.error('Error fetching workflow plan for faculty:', error)
    res.status(500).json({ error: 'Failed to fetch workflow plan for faculty' })
  }
})

router.post('/me/workflow/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const payload = completeTaskSchema.parse(req.body)

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    await workflowTargetsService.completeWorkflowTask({
      academicYear: payload.academicYear,
      facultyId: req.user.facultyId,
      facultyEmail: req.user.email,
      workflowType: payload.workflowType,
      slotNo: payload.slotNo,
      taskCode: payload.taskCode,
      payload: payload.payload,
    })

    res.json({ message: 'Task marked as completed' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error completing workflow task:', error)
    res.status(500).json({ error: 'Failed to complete workflow task' })
  }
})

export default router
