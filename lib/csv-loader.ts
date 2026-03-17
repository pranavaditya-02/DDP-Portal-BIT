/**
 * csv-loader.ts — SERVER-SIDE ONLY
 *
 * Reads the 8 approved-activity CSV exports from /assets/ and computes all
 * dashboard data on the fly.  No hardcoded numbers here — update the CSVs and
 * re-request /api/real-data (or wait for the 1-hour revalidation).
 *
 * SCORING RUBRIC (DDP-aligned weighted points)
 * ─────────────────────────────────────────────
 * Patent Granted      → International: 50 | National: 40
 * Patent Published    → International: 30 | National: 20
 * Patent Filed        → 10 (any level)
 * Paper Presentation  → International: 5  | National: 3
 * Guest Lecture given → Int / National: 5 | State / Institute / Others: 2
 * Online Course       → NPTEL/SWAYAM/AICTE/MOOC/IBM/GOOGLE/CISCO/edX/+ : 3
 *                        Udemy / Other : 2
 * Events Organized    → Int / National : 3 | State : 2 | Institute (BIT) : 1
 * Events Attended     → FDP/STTP/NPTEL-FDP/Certificate/Exchange/AICTE-* : 2
 *                        All others : 1
 */

import { readFile } from 'fs/promises'
import path from 'path'

import type { DeptActivityStats, FacultyRankEntry } from './real-data'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TYPES                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

export interface CollegeStats {
  totalDepartments: number
  totalUniqueFaculty: number
  totalWeightedPoints: number
  avgPointsPerFaculty: number
  patentFiled: number
  patentPublished: number
  patentGranted: number
  paperPresentations: number
  onlineCourses: number
  guestLectures: number
  eventsOrganized: number
  eventsAttended: number
  totalActivities: number
  totalPatents: number
}

export interface ActivityBreakdownItem {
  name: string
  count: number
  color: string
}

export interface LeaderboardEntry {
  rank: number
  facultyId: string
  name: string
  department: string
  points: number
  activities: number
  badge: 'gold' | 'silver' | 'bronze' | 'top10' | 'top20' | ''
}

/**
 * Optional date-range filter. Both boundaries are inclusive.
 * Dates come from HTML date inputs as YYYY-MM-DD strings.
 */
export interface DateFilter {
  from?: Date
  to?: Date
}

export interface AchievementData {
  deptStats: DeptActivityStats[]
  deptRankings: DeptActivityStats[]
  deptByActivity: DeptActivityStats[]
  deptMap: Record<string, DeptActivityStats>
  deptFacultyRankings: Record<string, FacultyRankEntry[]>
  collegeStats: CollegeStats
  activityBreakdown: ActivityBreakdownItem[]
  leaderboard: LeaderboardEntry[]
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CSV PARSER  (RFC 4180, handles quoted fields with embedded commas/newlines) */
/* ─────────────────────────────────────────────────────────────────────────── */

function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  let i = 0
  // strip UTF-8 BOM if present
  const s = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content

  while (i < s.length) {
    const ch = s[i]
    if (!inQ) {
      if (ch === '"') {
        inQ = true; i++
      } else if (ch === ',') {
        row.push(field); field = ''; i++
      } else if (ch === '\r' && s[i + 1] === '\n') {
        row.push(field); rows.push(row); row = []; field = ''; i += 2
      } else if (ch === '\n') {
        row.push(field); rows.push(row); row = []; field = ''; i++
      } else {
        field += ch; i++
      }
    } else {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2 }
        else { inQ = false; i++ }
      } else {
        field += ch; i++
      }
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

async function readCSV(filename: string): Promise<string[][]> {
  const filePath = path.join(process.cwd(), 'assets', filename)
  const content = await readFile(filePath, 'utf8')
  const rows = parseCSV(content)
  return rows.slice(1).filter(r => r.length > 4) // skip header, skip empty
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DEPARTMENT NORMALISATION                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

const FULL_NAME_MAP: Record<string, string> = {
  'aeronautical engineering':               'AE',
  'agricultural engineering':               'AG',
  'artificial intelligence and data science': 'AIDS',
  'artificial intelligence & data science': 'AIDS',
  'artificial intelligence and machine learning': 'AIML',
  'ai & machine learning':                  'AIML',
  'automobile engineering':                 'AU',
  'biomedical engineering':                 'BM',
  'biotechnology':                          'BT',
  'ceramic technology':                     'CT',
  'computer technology':                    'CT',
  'chemistry':                              'CH',
  'civil engineering':                      'CE',
  'computer science & engineering':         'CSE',
  'computer science and engineering':       'CSE',
  'computer science and business systems':  'CSBS',
  'computer science & business systems':    'CSBS',
  'computer science and design':            'CSD',
  'computer science design':                'CSD',
  'electrical and electronics engineering': 'EEE',
  'electrical & electronics engineering':   'EEE',
  'electronics and communication engineering': 'ECE',
  'electronics & communication engineering': 'ECE',
  'electronics and instrumentation engineering': 'EI',
  'electronics & instrumentation':          'EI',
  'fashion design':                         'FD',
  'fashion technology':                     'FD',
  'food technology':                        'FT',
  'humanities':                             'HU',
  'information science and engineering':    'ISE',
  'information science & engineering':      'ISE',
  'information technology':                 'IT',
  'master of computer applications':        'MC',
  'mathematics':                            'MA',
  'mechanical engineering':                 'ME',
  'mechatronics engineering':               'MZ',
  'meise':                                  'ME',
  'physics':                                'PH',
  'school of management studies':           'SMS',
  'textile technology':                     'TT',
  'textile processing':                     'TP',
}

// Valid short codes that pass through as-is
const VALID_SHORTS = new Set([
  'AE','AG','AIDS','AIML','AU','BM','BT','CE','CH','CSBS','CSD','CSE',
  'CT','ECE','EEE','EI','FD','FT','HU','ISE','IT','MA','MC','ME','MEISE',
  'MZ','PH','SMS','TP','TT',
])

function normalizeDept(raw: string): string {
  const trimmed = raw.trim()
  // Check if it's already a valid short code
  if (VALID_SHORTS.has(trimmed)) return trimmed === 'MEISE' ? 'ME' : trimmed
  // Try full-name lookup (case-insensitive)
  const lower = trimmed.toLowerCase()
  return FULL_NAME_MAP[lower] || trimmed
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SCORING FUNCTIONS                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const PREMIUM_COURSES = new Set([
  'NPTEL', 'SWAYAM-NPTEL', 'SWAYAM', 'AICTE', 'MOOC',
  'IBM', 'GOOGLE', 'CISCO', 'EDX', 'MICROSOFT', 'COURSERA', 'UGC',
])

const PREMIUM_EVENT_TYPES = new Set([
  'FDP', 'STTP', 'NPTEL-FDP', 'CERTIFICATE COURSE',
  'FACULTY EXCHANGE PROGRAMME', 'AICTE-UHE-FDP', 'AICTE-UHV-FDP',
  'INNOVATION AMBASSADOR- IIC CERTIFICATE', 'PS-CERTIFICATION',
])

function scorePatentGranted(level: string): number {
  return level.toUpperCase().includes('INTERNATIONAL') ? 50 : 40
}
function scorePatentPublished(level: string): number {
  return level.toUpperCase().includes('INTERNATIONAL') ? 30 : 20
}
function scorePaper(level: string): number {
  return level.toUpperCase().includes('INTERNATIONAL') ? 5 : 3
}
function scoreGuestLecture(level: string): number {
  const u = level.toUpperCase()
  return (u.includes('INTERNATIONAL') || u.includes('NATIONAL')) ? 5 : 2
}
function scoreOnlineCourse(type: string): number {
  return PREMIUM_COURSES.has(type.toUpperCase()) ? 3 : 2
}
function scoreEventsOrganized(level: string): number {
  const u = level.toUpperCase()
  if (u.includes('INTERNATIONAL') || u.includes('NATIONAL')) return 3
  if (u.includes('STATE')) return 2
  return 1 // Institute (BIT) or others
}
function scoreEventsAttended(eventType: string): number {
  return PREMIUM_EVENT_TYPES.has(eventType.toUpperCase()) ? 2 : 1
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  INTERNAL FACULTY ACCUMULATOR                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

interface FacultyAccumulator {
  id: string
  name: string
  dept: string
  points: number
  activities: number
  patentFiled: number
  patentPublished: number
  patentGranted: number
  paperPresentations: number
  onlineCourses: number
  guestLectures: number
  eventsOrganized: number
  eventsAttended: number
}

function getOrCreate(
  map: Map<string, FacultyAccumulator>,
  id: string,
  name: string,
  dept: string,
): FacultyAccumulator {
  const key = `${id}||${name}`
  if (!map.has(key)) {
    map.set(key, {
      id, name, dept, points: 0, activities: 0,
      patentFiled: 0, patentPublished: 0, patentGranted: 0,
      paperPresentations: 0, onlineCourses: 0, guestLectures: 0,
      eventsOrganized: 0, eventsAttended: 0,
    })
  }
  return map.get(key)!
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DEPT METADATA                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

const DEPT_FULL_NAMES: Record<string, string> = {
  AE: 'Aeronautical Engineering',
  AG: 'Agricultural Engineering',
  AIDS: 'Artificial Intelligence & Data Science',
  AIML: 'AI & Machine Learning',
  AU: 'Automobile Engineering',
  BM: 'Biomedical Engineering',
  BT: 'Biotechnology',
  CE: 'Civil Engineering',
  CH: 'Chemistry',
  CSBS: 'Computer Science & Business Systems',
  CSD: 'Computer Science and Design',
  CSE: 'Computer Science & Engineering',
  CT: 'Ceramic Technology',
  ECE: 'Electronics & Communication Engineering',
  EEE: 'Electrical & Electronics Engineering',
  EI: 'Electronics & Instrumentation',
  FD: 'Fashion Design',
  FT: 'Food Technology',
  HU: 'Humanities',
  ISE: 'Information Science & Engineering',
  IT: 'Information Technology',
  MA: 'Mathematics',
  MC: 'Master of Computer Applications',
  ME: 'Mechanical Engineering (incl. MEISE)',
  MZ: 'Mechatronics Engineering',
  PH: 'Physics',
  SMS: 'School of Management Studies',
  TP: 'Textile Processing',
  TT: 'Textile Technology',
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DATE HELPERS                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Month-abbreviation → 1-based number map (used in patent CSVs). */
const MON_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

/**
 * Parse a date string from any BIP CSV export into a UTC-midnight Date.
 * Handles two formats found across the 8 CSV files:
 *   DD-MM-YYYY  (Events, Online Courses, Paper Presentations, Guest Lectures)
 *   DD-Mon-YYYY (Patents — e.g. "01-Apr-2024")
 */
function parseCSVDate(s: string): Date | null {
  const parts = s.trim().split('-')
  if (parts.length !== 3) return null
  const [rawDd, rawMm, rawYyyy] = parts
  const dd   = parseInt(rawDd, 10)
  const yyyy = parseInt(rawYyyy, 10)
  if (!dd || !yyyy || yyyy < 1900) return null

  // Numeric month (DD-MM-YYYY)
  const mmNum = parseInt(rawMm, 10)
  const mm = isNaN(mmNum)
    ? MON_MAP[rawMm.toLowerCase()] ?? null  // month abbreviation (DD-Mon-YYYY)
    : mmNum

  if (!mm || mm < 1 || mm > 12) return null
  // Use UTC so comparisons are timezone-independent
  return new Date(Date.UTC(yyyy, mm - 1, dd))
}

/**
 * Returns true when the activity's date falls within the filter range.
 * If the cell is blank or unparseable the record is always included so
 * we never silently discard data due to missing dates.
 */
function inRange(dateStr: string, filter: DateFilter): boolean {
  if (!filter.from && !filter.to) return true
  const d = parseCSVDate(dateStr)
  if (!d) return true // include if date can't be read
  if (filter.from && d < filter.from) return false
  if (filter.to   && d > filter.to)   return false
  return true
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPUTATION                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

export async function computeAchievementData(filter: DateFilter = {}): Promise<AchievementData> {
  const faculty = new Map<string, FacultyAccumulator>()

  /* ── 1. Patent Filed ─────────────────────────────────────────────────── */
  const patentFiledRows = await readCSV(
    'Patent Filed (faculty)  -Approved-data-2026-03-07 11_39_07.csv',
  )
  for (const r of patentFiledRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    if (!id || !name || !dept) continue
    if (!inRange(r[10]?.trim() || '', filter)) continue // Date of Registration
    const pts = 10
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.patentFiled++
  }

  /* ── 2. Patent Published ──────────────────────────────────────────────── */
  const patentPubRows = await readCSV(
    'Patent Published (faculty)  - Approved-data-2026-03-07 11_39_12.csv',
  )
  for (const r of patentPubRows) {
    const id = r[3]?.trim(); const name = r[2]?.trim()
    const dept = normalizeDept(r[4]?.trim() || '')
    const level = r[21]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[9]?.trim() || '', filter)) continue // Date of Publication
    const pts = scorePatentPublished(level)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.patentPublished++
  }

  /* ── 3. Patent Granted ───────────────────────────────────────────────── */
  const patentGrantRows = await readCSV(
    'Patent Granted (faculty)  - Approved-data-2026-03-07 11_39_19.csv',
  )
  for (const r of patentGrantRows) {
    const id = r[3]?.trim(); const name = r[2]?.trim()
    const dept = normalizeDept(r[4]?.trim() || '')
    const level = r[21]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[9]?.trim() || '', filter)) continue // Date of Grant
    const pts = scorePatentGranted(level)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.patentGranted++
  }

  /* ── 4. Paper Presentation ───────────────────────────────────────────── */
  const paperRows = await readCSV(
    'Paper Presentation- Approved Proof-data-2026-03-07 11_38_55.csv',
  )
  for (const r of paperRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    const level = r[40]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[42]?.trim() || '', filter)) continue // Event Start Date
    const pts = scorePaper(level)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.paperPresentations++
  }

  /* ── 5. Guest Lectures ───────────────────────────────────────────────── */
  const guestRows = await readCSV(
    'Guest Lectures - Approved - Proof-data-2026-03-07 11_40_47.csv',
  )
  for (const r of guestRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    const level = r[11]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[13]?.trim() || '', filter)) continue // Start Date
    const pts = scoreGuestLecture(level)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.guestLectures++
  }

  /* ── 6. Online Courses ───────────────────────────────────────────────── */
  const onlineRows = await readCSV(
    'Online Course- Approved-Proof-data-2026-03-07 11_38_38.csv',
  )
  for (const r of onlineRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    const courseType = r[9]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[16]?.trim() || '', filter)) continue // Start Date
    const pts = scoreOnlineCourse(courseType)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.onlineCourses++
  }

  /* ── 7. Events Attended ──────────────────────────────────────────────── */
  const evtAttRows = await readCSV(
    'Events Attended -Approved - Proof-data-2026-03-07 11_37_51.csv',
  )
  for (const r of evtAttRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    const eventType = r[8]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[15]?.trim() || '', filter)) continue // Start Date
    const pts = scoreEventsAttended(eventType)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.eventsAttended++
  }

  /* ── 8. Events Organized ─────────────────────────────────────────────── */
  const evtOrgRows = await readCSV(
    'Events Organized -Approved - Proof-data-2026-03-07 11_37_33.csv',
  )
  for (const r of evtOrgRows) {
    const id = r[2]?.trim(); const name = r[1]?.trim()
    const dept = normalizeDept(r[3]?.trim() || '')
    const level = r[57]?.trim() || ''
    if (!id || !name || !dept) continue
    if (!inRange(r[54]?.trim() || '', filter)) continue // Start Date
    const pts = scoreEventsOrganized(level)
    const acc = getOrCreate(faculty, id, name, dept)
    acc.points += pts; acc.activities++; acc.eventsOrganized++
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  AGGREGATE BY DEPARTMENT                                                 */
  /* ─────────────────────────────────────────────────────────────────────── */

  interface DeptAcc {
    shortCode: string
    uniqueFaculty: Set<string>
    totalPoints: number
    paperPresentations: number
    onlineCourses: number
    guestLectures: number
    eventsOrganized: number
    eventsAttended: number
    patentPublished: number
    patentGranted: number
    patentFiled: number
    topFaculty: FacultyAccumulator | null
  }

  const depts = new Map<string, DeptAcc>()

  for (const acc of faculty.values()) {
    const code = acc.dept
    if (!code || code.length > 6) continue // skip garbage dept values
    if (!depts.has(code)) {
      depts.set(code, {
        shortCode: code,
        uniqueFaculty: new Set(),
        totalPoints: 0,
        paperPresentations: 0, onlineCourses: 0, guestLectures: 0,
        eventsOrganized: 0, eventsAttended: 0,
        patentPublished: 0, patentGranted: 0, patentFiled: 0,
        topFaculty: null,
      })
    }
    const d = depts.get(code)!
    d.uniqueFaculty.add(`${acc.id}||${acc.name}`)
    d.totalPoints += acc.points
    d.paperPresentations += acc.paperPresentations
    d.onlineCourses += acc.onlineCourses
    d.guestLectures += acc.guestLectures
    d.eventsOrganized += acc.eventsOrganized
    d.eventsAttended += acc.eventsAttended
    d.patentPublished += acc.patentPublished
    d.patentGranted += acc.patentGranted
    d.patentFiled += acc.patentFiled
    if (!d.topFaculty || acc.points > d.topFaculty.points) d.topFaculty = acc
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  BUILD DeptActivityStats[]                                               */
  /* ─────────────────────────────────────────────────────────────────────── */

  const deptStats: DeptActivityStats[] = []
  for (const [code, d] of depts.entries()) {
    const nFaculty = d.uniqueFaculty.size
    const total =
      d.paperPresentations + d.onlineCourses + d.guestLectures +
      d.eventsOrganized + d.eventsAttended +
      d.patentPublished + d.patentGranted + d.patentFiled
    deptStats.push({
      dept: DEPT_FULL_NAMES[code] || code,
      shortCode: code,
      uniqueFaculty: nFaculty,
      topPerformerId: d.topFaculty?.id || '',
      topPerformer: d.topFaculty?.name || '',
      topPerformerPoints: d.topFaculty?.points || 0,
      topPerformerActivities: d.topFaculty?.activities || 0,
      totalPoints: d.totalPoints,
      avgPoints: nFaculty > 0 ? Math.round(d.totalPoints / nFaculty) : 0,
      paperPresentations: d.paperPresentations,
      onlineCourses: d.onlineCourses,
      guestLectures: d.guestLectures,
      eventsOrganized: d.eventsOrganized,
      eventsAttended: d.eventsAttended,
      patentPublished: d.patentPublished,
      patentGranted: d.patentGranted,
      patentFiled: d.patentFiled,
      total,
    })
  }

  const deptRankings = [...deptStats].sort((a, b) => b.totalPoints - a.totalPoints)
  const deptByActivity = [...deptStats].sort((a, b) => b.total - a.total)
  const deptMap: Record<string, DeptActivityStats> = {}
  for (const d of deptStats) deptMap[d.shortCode] = d

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  COLLEGE-WIDE STATS                                                      */
  /* ─────────────────────────────────────────────────────────────────────── */

  const totalUniqueFaculty = faculty.size
  const totalWeightedPoints = deptStats.reduce((s, d) => s + d.totalPoints, 0)
  const totalPatentFiled = deptStats.reduce((s, d) => s + d.patentFiled, 0)
  const totalPatentPub = deptStats.reduce((s, d) => s + d.patentPublished, 0)
  const totalPatentGrant = deptStats.reduce((s, d) => s + d.patentGranted, 0)
  const totalPapers = deptStats.reduce((s, d) => s + d.paperPresentations, 0)
  const totalCourses = deptStats.reduce((s, d) => s + d.onlineCourses, 0)
  const totalGuestLec = deptStats.reduce((s, d) => s + d.guestLectures, 0)
  const totalEvtOrg = deptStats.reduce((s, d) => s + d.eventsOrganized, 0)
  const totalEvtAtt = deptStats.reduce((s, d) => s + d.eventsAttended, 0)
  const totalActivities =
    totalPatentFiled + totalPatentPub + totalPatentGrant +
    totalPapers + totalCourses + totalGuestLec + totalEvtOrg + totalEvtAtt

  const collegeStats: CollegeStats = {
    totalDepartments: deptStats.length,
    totalUniqueFaculty,
    totalWeightedPoints,
    avgPointsPerFaculty: totalUniqueFaculty > 0
      ? Math.round(totalWeightedPoints / totalUniqueFaculty)
      : 0,
    patentFiled: totalPatentFiled,
    patentPublished: totalPatentPub,
    patentGranted: totalPatentGrant,
    paperPresentations: totalPapers,
    onlineCourses: totalCourses,
    guestLectures: totalGuestLec,
    eventsOrganized: totalEvtOrg,
    eventsAttended: totalEvtAtt,
    totalActivities,
    totalPatents: totalPatentFiled + totalPatentPub + totalPatentGrant,
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  ACTIVITY BREAKDOWN (for charts)                                         */
  /* ─────────────────────────────────────────────────────────────────────── */

  const activityBreakdown: ActivityBreakdownItem[] = [
    { name: 'Events Attended',    count: totalEvtAtt,      color: '#3b82f6' },
    { name: 'Online Courses',     count: totalCourses,     color: '#10b981' },
    { name: 'Events Organized',   count: totalEvtOrg,      color: '#8b5cf6' },
    { name: 'Paper Presentations',count: totalPapers,      color: '#f59e0b' },
    { name: 'Guest Lectures',     count: totalGuestLec,    color: '#6366f1' },
    { name: 'Patent Filed',       count: totalPatentFiled, color: '#ef4444' },
    { name: 'Patent Published',   count: totalPatentPub,   color: '#ec4899' },
    { name: 'Patent Granted',     count: totalPatentGrant, color: '#14b8a6' },
  ]

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  DEPT FACULTY RANKINGS                                                   */
  /* ─────────────────────────────────────────────────────────────────────── */

  // Group all faculty by dept, sorted by points
  const byDept = new Map<string, FacultyAccumulator[]>()
  for (const acc of faculty.values()) {
    const code = acc.dept
    if (!code || code.length > 6) continue
    if (!byDept.has(code)) byDept.set(code, [])
    byDept.get(code)!.push(acc)
  }

  const deptFacultyRankings: Record<string, FacultyRankEntry[]> = {}
  for (const [code, list] of byDept.entries()) {
    list.sort((a, b) => b.points - a.points)
    deptFacultyRankings[code] = list.map((f, idx) => ({
      rank: idx + 1,
      facultyId: f.id,
      name: f.name,
      points: f.points,
      activities: f.activities,
      badge: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze'
           : idx < 10 ? 'top10' : idx < 20 ? 'top20' : '',
      papers: f.paperPresentations,
      patents: f.patentFiled + f.patentPublished + f.patentGranted,
      courses: f.onlineCourses,
      guestLectures: f.guestLectures,
      eventsOrganized: f.eventsOrganized,
      eventsAttended: f.eventsAttended,
    } as FacultyRankEntry))
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  COLLEGE LEADERBOARD (top 20)                                            */
  /* ─────────────────────────────────────────────────────────────────────── */

  const allFaculty = [...faculty.values()].sort((a, b) => b.points - a.points)
  const leaderboard: LeaderboardEntry[] = allFaculty.slice(0, 20).map((f, i) => ({
    rank: i + 1,
    facultyId: f.id,
    name: f.name,
    department: f.dept,
    points: f.points,
    activities: f.activities,
    badge: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze'
         : i < 10 ? 'top10' : 'top20',
  }))

  return {
    deptStats,
    deptRankings,
    deptByActivity,
    deptMap,
    deptFacultyRankings,
    collegeStats,
    activityBreakdown,
    leaderboard,
  }
}
