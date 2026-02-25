// ============================================================
// DDP (Department Development Plan) INDICATOR DATA
// Modeled after the real DDP dashboard at dashboard.bitsathy.ac.in
// ============================================================

// ---- Types ----
export interface DDPActivity {
  sNo: number
  activityName: string
  weightage: number
  totalTarget: number
  attained: number
  actualIndex: number
  permittedIndex: number
}

export interface DDPDepartmentOverall {
  rank: number
  department: string
  shortName: string
  totalTarget: number
  achieved: number
  baseIndex: number
  additionalIndex: number
  normalizedBonus: number
}

export interface DDPActivityWiseStatus {
  sNo: number
  department: string
  shortName: string
  totalTarget: number
  achieved: number
  pending: number
  bipIds: string
}

export interface DDPMonthlyAttainment {
  activityName: string
  planned: number
  achievedPlanned: number
  pending: number
  achievedUnplanned: number
}

export interface DDPMonthlyDeptActivity {
  department: string
  activityName: string
  actualPlanned: number
  achievedPlanned: number
  pending: number
  achievedUnplanned: number
}

export interface DDPActivityOverall {
  activityName: string
  proposedTarget: number
  proposedAchieved: number
  pending: number
}

// ---- Overall Indexing (All Departments Ranking) ----
export const ddpOverallIndexing: DDPDepartmentOverall[] = [
  { rank: 1, department: 'Mechanical Engineering', shortName: 'MECH', totalTarget: 413, achieved: 305, baseIndex: 0.450, additionalIndex: 0.152, normalizedBonus: 0.498 },
  { rank: 2, department: 'Computer Science & Engineering', shortName: 'CSE', totalTarget: 1060, achieved: 819, baseIndex: 0.446, additionalIndex: 0.0790, normalizedBonus: 0.471 },
  { rank: 3, department: 'Electrical and Electronics Engineering', shortName: 'EEE', totalTarget: 397, achieved: 318, baseIndex: 0.399, additionalIndex: 0.129, normalizedBonus: 0.440 },
  { rank: 4, department: 'Agricultural Engineering', shortName: 'AGRI', totalTarget: 205, achieved: 156, baseIndex: 0.356, additionalIndex: 0.127, normalizedBonus: 0.396 },
  { rank: 5, department: 'Artificial Intelligence and Machine Learning', shortName: 'AIML', totalTarget: 530, achieved: 299, baseIndex: 0.367, additionalIndex: 0.0340, normalizedBonus: 0.378 },
  { rank: 6, department: 'Electronics and Communication Engineering', shortName: 'ECE', totalTarget: 945, achieved: 631, baseIndex: 0.355, additionalIndex: 0.0560, normalizedBonus: 0.373 },
  { rank: 7, department: 'Biotechnology', shortName: 'BIOTECH', totalTarget: 409, achieved: 394, baseIndex: 0.340, additionalIndex: 0.0780, normalizedBonus: 0.365 },
  { rank: 8, department: 'Electronics and Instrumentation Engineering', shortName: 'EIE', totalTarget: 299, achieved: 243, baseIndex: 0.331, additionalIndex: 0.0710, normalizedBonus: 0.353 },
  { rank: 9, department: 'Artificial Intelligence and Data Science', shortName: 'AIDS', totalTarget: 822, achieved: 443, baseIndex: 0.332, additionalIndex: 0.0520, normalizedBonus: 0.348 },
  { rank: 10, department: 'Food Technology', shortName: 'FT', totalTarget: 112, achieved: 102, baseIndex: 0.241, additionalIndex: 0.159, normalizedBonus: 0.291 },
  { rank: 11, department: 'Mechatronics Engineering', shortName: 'MTRX', totalTarget: 326, achieved: 182, baseIndex: 0.256, additionalIndex: 0.0520, normalizedBonus: 0.272 },
  { rank: 12, department: 'Civil Engineering', shortName: 'CIVIL', totalTarget: 280, achieved: 168, baseIndex: 0.230, additionalIndex: 0.045, normalizedBonus: 0.248 },
  { rank: 13, department: 'Computer Science and Design', shortName: 'CSD', totalTarget: 185, achieved: 92, baseIndex: 0.210, additionalIndex: 0.032, normalizedBonus: 0.225 },
  { rank: 14, department: 'Information Technology', shortName: 'IT', totalTarget: 420, achieved: 238, baseIndex: 0.295, additionalIndex: 0.041, normalizedBonus: 0.315 },
  { rank: 15, department: 'Computer Technology', shortName: 'CT', totalTarget: 156, achieved: 88, baseIndex: 0.218, additionalIndex: 0.028, normalizedBonus: 0.232 },
]

// ---- CSE Department: Index Calculation ----
export const cseTotalWeightage = 100
export const cseTotalIndex = 0.451
export const cseAdditionalIndex = 0.0790

// ---- CSE Department: Activity-wise Total Indexing ----
export const cseActivityIndexing: DDPActivity[] = [
  { sNo: 1, activityName: 'JOURNAL PUBLICATIONS (SCI / WOS)', weightage: 5, totalTarget: 21, attained: 20, actualIndex: 0.952, permittedIndex: 0.952 },
  { sNo: 2, activityName: 'JOURNAL PUBLICATIONS (SCOPUS)', weightage: 5, totalTarget: 35, attained: 32, actualIndex: 0.914, permittedIndex: 0.914 },
  { sNo: 3, activityName: 'CONFERENCE PUBLICATIONS', weightage: 3, totalTarget: 45, attained: 42, actualIndex: 0.933, permittedIndex: 0.933 },
  { sNo: 4, activityName: 'BOOK / BOOK CHAPTER PUBLISHED', weightage: 2, totalTarget: 8, attained: 6, actualIndex: 0.750, permittedIndex: 0.750 },
  { sNo: 5, activityName: 'RESEARCH PROPOSALS SUBMITTED', weightage: 3, totalTarget: 15, attained: 12, actualIndex: 0.800, permittedIndex: 0.800 },
  { sNo: 6, activityName: 'RESEARCH FUNDING, RS. IN LAKHS', weightage: 5, totalTarget: 60, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 7, activityName: 'PATENTS PUBLISHED', weightage: 3, totalTarget: 12, attained: 10, actualIndex: 0.833, permittedIndex: 0.833 },
  { sNo: 8, activityName: 'PATENTS GRANTED', weightage: 3, totalTarget: 5, attained: 3, actualIndex: 0.600, permittedIndex: 0.600 },
  { sNo: 9, activityName: 'CONSULTANCY PROJECTS COMPLETED', weightage: 3, totalTarget: 8, attained: 5, actualIndex: 0.625, permittedIndex: 0.625 },
  { sNo: 10, activityName: 'INDUSTRIAL CONSULTANCY PROJECTS, RS IN LAKHS', weightage: 3, totalTarget: 12, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 11, activityName: 'SEED MONEY PROJECTS', weightage: 2, totalTarget: 6, attained: 4, actualIndex: 0.667, permittedIndex: 0.667 },
  { sNo: 12, activityName: 'GUEST LECTURE DELIVERED', weightage: 2, totalTarget: 9, attained: 7, actualIndex: 0.778, permittedIndex: 0.778 },
  { sNo: 13, activityName: 'MOU SIGNED', weightage: 2, totalTarget: 1, attained: 1, actualIndex: 1.000, permittedIndex: 1.000 },
  { sNo: 14, activityName: 'INTERNATIONAL MOU SIGNED', weightage: 3, totalTarget: 1, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 15, activityName: 'INVITE NEW COMPANIES FOR STUDENT PLACEMENTS', weightage: 6, totalTarget: 20, attained: 12, actualIndex: 0.600, permittedIndex: 0.600 },
  { sNo: 16, activityName: 'PLACEMENT TARGETS', weightage: 6, totalTarget: 60, attained: 7, actualIndex: 0.117, permittedIndex: 0.117 },
  { sNo: 17, activityName: 'INDUSTRY COLLABORATIVE / SUPPORTING / SPONSORED LECTURES', weightage: 2, totalTarget: 1, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 18, activityName: 'INVITING SCIENTISTS / EXPERTS FROM REPUTED RESEARCH LABS', weightage: 2, totalTarget: 1, attained: 2, actualIndex: 2.000, permittedIndex: 1.000 },
  { sNo: 19, activityName: 'COLLABORATIVE INITIATIVES IN FUNDING, CONSULTANCY, PROJECTS', weightage: 3, totalTarget: 12, attained: 50, actualIndex: 4.170, permittedIndex: 1.000 },
  { sNo: 20, activityName: 'FDP / STTP ORGANISED', weightage: 3, totalTarget: 1, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 21, activityName: 'PARTIAL DELIVERY OF COURSES', weightage: 2, totalTarget: 2, attained: 2, actualIndex: 1.000, permittedIndex: 1.000 },
  { sNo: 22, activityName: 'CERTIFICATE / VALUE-ADDED COURSES / PS', weightage: 2, totalTarget: 2, attained: 0, actualIndex: 0.000, permittedIndex: 0.000 },
  { sNo: 23, activityName: 'NPTEL COURSES', weightage: 3, totalTarget: 15, attained: 8, actualIndex: 0.533, permittedIndex: 0.533 },
  { sNo: 24, activityName: 'STUDENT AWARDS / ACHIEVEMENTS', weightage: 5, totalTarget: 25, attained: 18, actualIndex: 0.720, permittedIndex: 0.720 },
  { sNo: 25, activityName: 'EVENTS ORGANIZED', weightage: 5, totalTarget: 680, attained: 575, actualIndex: 0.846, permittedIndex: 0.846 },
]

// ---- Overall Activity-wise DDP Attainment Status (Journal Publications SCI/WOS as example) ----
export const ddpJournalPublicationsOverall: DDPActivityOverall = {
  activityName: 'JOURNAL PUBLICATIONS (SCI / WOS)',
  proposedTarget: 238,
  proposedAchieved: 168,
  pending: 70,
}

export const ddpJournalDeptBreakdown: DDPActivityWiseStatus[] = [
  { sNo: 1, department: 'Agricultural Engineering', shortName: 'AGRI', totalTarget: 5, achieved: 8, pending: -3, bipIds: '2478, 2490' },
  { sNo: 2, department: 'Artificial Intelligence and Data Science', shortName: 'AIDS', totalTarget: 15, achieved: 2, pending: 13, bipIds: '2560, 2663' },
  { sNo: 3, department: 'Artificial Intelligence and Machine Learning', shortName: 'AIML', totalTarget: 5, achieved: 5, pending: 0, bipIds: '2515, 2703' },
  { sNo: 4, department: 'Biomedical Engineering', shortName: 'BME', totalTarget: 2, achieved: 1, pending: 1, bipIds: '2676' },
  { sNo: 5, department: 'Biotechnology', shortName: 'BIOTECH', totalTarget: 9, achieved: 8, pending: 1, bipIds: '2648, 2649' },
  { sNo: 6, department: 'Chemistry', shortName: 'CHEM', totalTarget: 15, achieved: 19, pending: -4, bipIds: '2370, 2388' },
  { sNo: 7, department: 'Civil Engineering', shortName: 'CIVIL', totalTarget: 6, achieved: 4, pending: 2, bipIds: '2431, 2491' },
  { sNo: 8, department: 'Computer Science and Business Systems', shortName: 'CSBS', totalTarget: 1, achieved: 0, pending: 1, bipIds: '' },
  { sNo: 9, department: 'Computer Science and Design', shortName: 'CSD', totalTarget: 0, achieved: 0, pending: 0, bipIds: '' },
  { sNo: 10, department: 'Computer Science & Engineering', shortName: 'CSE', totalTarget: 21, achieved: 20, pending: 1, bipIds: '2304, 2495' },
  { sNo: 11, department: 'Computer Technology', shortName: 'CT', totalTarget: 3, achieved: 1, pending: 2, bipIds: '2743' },
  { sNo: 12, department: 'Electrical and Electronics Engineering', shortName: 'EEE', totalTarget: 16, achieved: 8, pending: 8, bipIds: '2475, 2592' },
  { sNo: 13, department: 'Electronics and Communication Engineering', shortName: 'ECE', totalTarget: 27, achieved: 22, pending: 5, bipIds: '2316, 2372' },
  { sNo: 14, department: 'Electronics and Instrumentation Engineering', shortName: 'EIE', totalTarget: 8, achieved: 5, pending: 3, bipIds: '2410, 2455' },
  { sNo: 15, department: 'Food Technology', shortName: 'FT', totalTarget: 3, achieved: 4, pending: -1, bipIds: '2520' },
  { sNo: 16, department: 'Information Technology', shortName: 'IT', totalTarget: 12, achieved: 8, pending: 4, bipIds: '2380, 2445' },
  { sNo: 17, department: 'Mechanical Engineering', shortName: 'MECH', totalTarget: 18, achieved: 15, pending: 3, bipIds: '2290, 2350' },
  { sNo: 18, department: 'Mechatronics Engineering', shortName: 'MTRX', totalTarget: 8, achieved: 4, pending: 4, bipIds: '2680, 2715' },
  { sNo: 19, department: 'Mathematics', shortName: 'MATH', totalTarget: 10, achieved: 12, pending: -2, bipIds: '2340, 2398' },
  { sNo: 20, department: 'Physics', shortName: 'PHY', totalTarget: 8, achieved: 6, pending: 2, bipIds: '2420, 2485' },
  { sNo: 21, department: 'School of Management Studies', shortName: 'SMS', totalTarget: 6, achieved: 3, pending: 3, bipIds: '2580, 2606, 2750' },
  { sNo: 22, department: 'Textile Technology', shortName: 'TT', totalTarget: 1, achieved: 0, pending: 1, bipIds: '' },
]

// ---- Month-wise DDP Attainment (CSE Department) ----
export const cseMonthlyDDPStatus = {
  planned: 72,
  achievedPlanned: 0,
  pending: 72,
  achievedUnplanned: 0,
}

export const cseMonthlyActivities: DDPMonthlyAttainment[] = [
  { activityName: 'RESEARCH FUNDING, RS. IN LAKHS', planned: 60, achievedPlanned: 0, pending: 60, achievedUnplanned: 0 },
  { activityName: 'INDUSTRIAL CONSULTANCY PROJECTS, RS IN LAKHS', planned: 12, achievedPlanned: 0, pending: 12, achievedUnplanned: 0 },
]

// ---- Activity-wise Monthly Attainment Status ----
export const cseMonthlyActivityStatus: DDPMonthlyDeptActivity[] = [
  { department: 'Computer Science & Engineering', activityName: 'JOURNAL PUBLICATIONS (SCI / WOS)', actualPlanned: 21, achievedPlanned: 20, pending: 1, achievedUnplanned: 0 },
]

// ---- Overall Targets, Achieved, and Pending (All Activities) ----
export const ddpOverallTotals = {
  proposedTargets: 7314,
  proposedAchieved: 5146,
  pending: 1497,
}

// ---- All Activities Summary (College-wide) ----
export const ddpAllActivities: DDPActivityOverall[] = [
  { activityName: 'JOURNAL PUBLICATIONS (SCI / WOS)', proposedTarget: 238, proposedAchieved: 168, pending: 70 },
  { activityName: 'JOURNAL PUBLICATIONS (SCOPUS)', proposedTarget: 380, proposedAchieved: 285, pending: 95 },
  { activityName: 'CONFERENCE PUBLICATIONS', proposedTarget: 520, proposedAchieved: 412, pending: 108 },
  { activityName: 'BOOK / BOOK CHAPTER PUBLISHED', proposedTarget: 85, proposedAchieved: 62, pending: 23 },
  { activityName: 'RESEARCH PROPOSALS SUBMITTED', proposedTarget: 165, proposedAchieved: 128, pending: 37 },
  { activityName: 'RESEARCH FUNDING, RS. IN LAKHS', proposedTarget: 480, proposedAchieved: 215, pending: 265 },
  { activityName: 'PATENTS PUBLISHED', proposedTarget: 142, proposedAchieved: 108, pending: 34 },
  { activityName: 'PATENTS GRANTED', proposedTarget: 58, proposedAchieved: 32, pending: 26 },
  { activityName: 'CONSULTANCY PROJECTS', proposedTarget: 95, proposedAchieved: 68, pending: 27 },
  { activityName: 'INDUSTRIAL CONSULTANCY, RS IN LAKHS', proposedTarget: 120, proposedAchieved: 45, pending: 75 },
  { activityName: 'SEED MONEY PROJECTS', proposedTarget: 72, proposedAchieved: 48, pending: 24 },
  { activityName: 'GUEST LECTURES DELIVERED', proposedTarget: 185, proposedAchieved: 152, pending: 33 },
  { activityName: 'MOU SIGNED', proposedTarget: 42, proposedAchieved: 35, pending: 7 },
  { activityName: 'INTERNATIONAL MOU SIGNED', proposedTarget: 18, proposedAchieved: 8, pending: 10 },
  { activityName: 'NEW COMPANIES FOR PLACEMENTS', proposedTarget: 280, proposedAchieved: 195, pending: 85 },
  { activityName: 'PLACEMENT TARGETS', proposedTarget: 850, proposedAchieved: 520, pending: 330 },
  { activityName: 'INDUSTRY COLLABORATIVE LECTURES', proposedTarget: 65, proposedAchieved: 42, pending: 23 },
  { activityName: 'EXPERTS FROM RESEARCH LABS', proposedTarget: 48, proposedAchieved: 38, pending: 10 },
  { activityName: 'COLLABORATIVE INITIATIVES', proposedTarget: 135, proposedAchieved: 98, pending: 37 },
  { activityName: 'FDP / STTP ORGANISED', proposedTarget: 92, proposedAchieved: 65, pending: 27 },
  { activityName: 'PARTIAL DELIVERY OF COURSES', proposedTarget: 55, proposedAchieved: 42, pending: 13 },
  { activityName: 'CERTIFICATE / VALUE-ADDED COURSES', proposedTarget: 180, proposedAchieved: 135, pending: 45 },
  { activityName: 'NPTEL COURSES', proposedTarget: 220, proposedAchieved: 168, pending: 52 },
  { activityName: 'STUDENT AWARDS', proposedTarget: 310, proposedAchieved: 248, pending: 62 },
  { activityName: 'EVENTS ORGANIZED', proposedTarget: 2479, proposedAchieved: 1949, pending: 530 },
]

// ---- Monthly Trend by Month (for time-series charts) ----
export const ddpMonthlyTrend = [
  { month: 'Jun 2025', target: 610, achieved: 320, pending: 290, index: 0.182 },
  { month: 'Jul 2025', target: 610, achieved: 485, pending: 125, index: 0.248 },
  { month: 'Aug 2025', target: 610, achieved: 590, pending: 20, index: 0.312 },
  { month: 'Sep 2025', target: 610, achieved: 605, pending: 5, index: 0.345 },
  { month: 'Oct 2025', target: 610, achieved: 608, pending: 2, index: 0.368 },
  { month: 'Nov 2025', target: 610, achieved: 580, pending: 30, index: 0.385 },
  { month: 'Dec 2025', target: 610, achieved: 545, pending: 65, index: 0.398 },
  { month: 'Jan 2026', target: 610, achieved: 620, pending: 0, index: 0.425 },
  { month: 'Feb 2026', target: 610, achieved: 435, pending: 175, index: 0.442 },
]

// ---- Department Comparison across Key DDP Activities ----
export const ddpDeptActivityComparison = [
  { activity: 'Journal (SCI)', CSE: 95, ECE: 81, MECH: 83, EEE: 50, AIML: 100, AIDS: 13, BIOTECH: 89 },
  { activity: 'Conference', CSE: 93, ECE: 85, MECH: 78, EEE: 72, AIML: 88, AIDS: 65, BIOTECH: 82 },
  { activity: 'Patents', CSE: 83, ECE: 75, MECH: 90, EEE: 60, AIML: 70, AIDS: 45, BIOTECH: 55 },
  { activity: 'Placements', CSE: 12, ECE: 35, MECH: 42, EEE: 28, AIML: 22, AIDS: 18, BIOTECH: 52 },
  { activity: 'Research Funding', CSE: 0, ECE: 25, MECH: 55, EEE: 30, AIML: 15, AIDS: 10, BIOTECH: 40 },
  { activity: 'Guest Lectures', CSE: 78, ECE: 65, MECH: 72, EEE: 55, AIML: 80, AIDS: 42, BIOTECH: 68 },
  { activity: 'FDP Organised', CSE: 0, ECE: 50, MECH: 67, EEE: 33, AIML: 40, AIDS: 20, BIOTECH: 75 },
]

// ---- Key Insights derived from DDP data ----
export function getDDPInsights() {
  const overallRate = ((ddpOverallTotals.proposedAchieved / ddpOverallTotals.proposedTargets) * 100)
  
  // Top & bottom departments
  const topDept = ddpOverallIndexing[0]
  const bottomDept = ddpOverallIndexing[ddpOverallIndexing.length - 1]
  
  // Activities with 0 achievement (critical)
  const criticalActivities = cseActivityIndexing.filter(a => a.attained === 0)
  
  // Activities exceeding target
  const exceedingActivities = cseActivityIndexing.filter(a => a.attained > a.totalTarget)
  
  // Biggest gap activities (college-wide)
  const biggestGaps = [...ddpAllActivities]
    .sort((a, b) => (b.pending / Math.max(b.proposedTarget, 1)) - (a.pending / Math.max(a.proposedTarget, 1)))
    .slice(0, 5)
  
  // Best performing activities
  const bestPerforming = [...ddpAllActivities]
    .sort((a, b) => (b.proposedAchieved / Math.max(b.proposedTarget, 1)) - (a.proposedAchieved / Math.max(a.proposedTarget, 1)))
    .slice(0, 5)
  
  // Department with highest pending in journal pubs
  const highestPendingDept = [...ddpJournalDeptBreakdown]
    .sort((a, b) => b.pending - a.pending)[0]
  
  // Departments exceeding targets (negative pending)
  const exceedingDepts = ddpJournalDeptBreakdown.filter(d => d.pending < 0)
  
  return {
    overallRate,
    topDept,
    bottomDept,
    criticalActivities,
    exceedingActivities,
    biggestGaps,
    bestPerforming,
    highestPendingDept,
    exceedingDepts,
  }
}

// ---- Category-wise Achievement Rates (for donut chart) ----
export const ddpCategoryAchievementRates = [
  { name: 'Research & Publications', value: 72, total: 1588, achieved: 1143, color: '#3b82f6' },
  { name: 'Industry & Consultancy', value: 58, total: 695, achieved: 403, color: '#8b5cf6' },
  { name: 'Teaching & Training', value: 78, total: 512, achieved: 399, color: '#10b981' },
  { name: 'Placements', value: 63, total: 1130, achieved: 715, color: '#f59e0b' },
  { name: 'Extension & Awards', value: 81, total: 2789, achieved: 2197, color: '#ef4444' },
  { name: 'MOU & Collaboration', value: 65, total: 308, achieved: 200, color: '#ec4899' },
]

// ---- Heatmap data: Department vs Activity Achievement % ----
export const ddpHeatmapData = [
  { dept: 'CSE', journals: 95, conferences: 93, patents: 83, placements: 12, funding: 0, guestLectures: 78, fdp: 0, nptel: 53, events: 85 },
  { dept: 'ECE', journals: 81, conferences: 85, patents: 75, placements: 35, funding: 25, guestLectures: 65, fdp: 50, nptel: 60, events: 78 },
  { dept: 'MECH', journals: 83, conferences: 78, patents: 90, placements: 42, funding: 55, guestLectures: 72, fdp: 67, nptel: 48, events: 82 },
  { dept: 'EEE', journals: 50, conferences: 72, patents: 60, placements: 28, funding: 30, guestLectures: 55, fdp: 33, nptel: 45, events: 65 },
  { dept: 'AIML', journals: 100, conferences: 88, patents: 70, placements: 22, funding: 15, guestLectures: 80, fdp: 40, nptel: 65, events: 75 },
  { dept: 'AIDS', journals: 13, conferences: 65, patents: 45, placements: 18, funding: 10, guestLectures: 42, fdp: 20, nptel: 38, events: 55 },
  { dept: 'BIOTECH', journals: 89, conferences: 82, patents: 55, placements: 52, funding: 40, guestLectures: 68, fdp: 75, nptel: 58, events: 80 },
  { dept: 'EIE', journals: 63, conferences: 70, patents: 50, placements: 38, funding: 28, guestLectures: 55, fdp: 42, nptel: 50, events: 72 },
  { dept: 'IT', journals: 67, conferences: 75, patents: 55, placements: 30, funding: 20, guestLectures: 60, fdp: 35, nptel: 55, events: 70 },
  { dept: 'CIVIL', journals: 67, conferences: 68, patents: 42, placements: 45, funding: 35, guestLectures: 58, fdp: 55, nptel: 42, events: 68 },
]

// ---- CSE Department Month-by-Month Activity Tracking ----
export const cseDDPMonthlyBreakdown = [
  { month: 'Jun', journalSCI: 1, journalScopus: 2, conferences: 3, patents: 0, placements: 0, funding: 0, events: 45, total: 62 },
  { month: 'Jul', journalSCI: 2, journalScopus: 3, conferences: 4, patents: 1, placements: 0, funding: 0, events: 55, total: 78 },
  { month: 'Aug', journalSCI: 3, journalScopus: 4, conferences: 5, patents: 2, placements: 1, funding: 0, events: 65, total: 95 },
  { month: 'Sep', journalSCI: 2, journalScopus: 3, conferences: 5, patents: 1, placements: 1, funding: 0, events: 70, total: 98 },
  { month: 'Oct', journalSCI: 3, journalScopus: 4, conferences: 6, patents: 2, placements: 2, funding: 0, events: 80, total: 115 },
  { month: 'Nov', journalSCI: 3, journalScopus: 5, conferences: 5, patents: 1, placements: 1, funding: 0, events: 75, total: 108 },
  { month: 'Dec', journalSCI: 2, journalScopus: 4, conferences: 4, patents: 1, placements: 1, funding: 0, events: 68, total: 92 },
  { month: 'Jan', journalSCI: 3, journalScopus: 4, conferences: 6, patents: 1, placements: 1, funding: 0, events: 72, total: 102 },
  { month: 'Feb', journalSCI: 1, journalScopus: 3, conferences: 4, patents: 1, placements: 0, funding: 0, events: 45, total: 69 },
]
