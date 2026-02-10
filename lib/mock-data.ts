// ============================================================
// Mock Data for Faculty Achievement Tracking System
// ============================================================

export interface Activity {
  id: number
  title: string
  type: string
  category: string
  date: string
  status: 'approved' | 'pending' | 'rejected'
  points: number
  facultyName?: string
  facultyId?: number
  department?: string
  proofUrl?: string
}

export interface FacultyMember {
  id: number
  name: string
  email: string
  department: string
  designation: string
  totalPoints: number
  activitiesCount: number
  avatar?: string
  joinedDate: string
}

export interface DepartmentStat {
  name: string
  shortName: string
  facultyCount: number
  totalActivities: number
  avgPoints: number
  topPerformer: string
  pendingApprovals: number
}

export interface MonthlyTrend {
  month: string
  activities: number
  points: number
  approved: number
  pending: number
}

export interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
  color: string
}

// ---- Faculty Activities (for Faculty role) ----
export const myActivities: Activity[] = [
  { id: 1, title: 'Published paper in IEEE Transactions on Neural Networks', type: 'Journal Publication', category: 'Research', date: '2026-01-15', status: 'approved', points: 50 },
  { id: 2, title: 'Attended FDP on Machine Learning at IIT Madras', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-08', status: 'approved', points: 20 },
  { id: 3, title: 'Filed patent for IoT-based Smart Agriculture System', type: 'Patent', category: 'Research', date: '2025-12-20', status: 'approved', points: 75 },
  { id: 4, title: 'Guest lecture at Anna University on Cloud Computing', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-22', status: 'pending', points: 15 },
  { id: 5, title: 'Organized National Workshop on Cybersecurity', type: 'Event Organized', category: 'Service', date: '2025-12-10', status: 'approved', points: 30 },
  { id: 6, title: 'Conference paper at ICACCI 2026', type: 'Conference Paper', category: 'Research', date: '2026-02-01', status: 'pending', points: 35 },
  { id: 7, title: 'Completed NPTEL certification on Deep Learning', type: 'Certification', category: 'Professional Development', date: '2025-11-28', status: 'approved', points: 15 },
  { id: 8, title: 'Mentored 3 students for Smart India Hackathon', type: 'Student Mentoring', category: 'Teaching', date: '2025-12-05', status: 'approved', points: 20 },
  { id: 9, title: 'Book chapter in Springer: AI in Healthcare', type: 'Book Chapter', category: 'Research', date: '2026-02-05', status: 'pending', points: 40 },
  { id: 10, title: 'Industry consultancy project with TCS', type: 'Consultancy', category: 'Industry', date: '2025-11-15', status: 'approved', points: 45 },
]

// ---- Pending verification queue ----
export const pendingActivities: Activity[] = [
  { id: 101, title: 'Published paper in Elsevier - Computer Networks', type: 'Journal Publication', category: 'Research', date: '2026-02-03', status: 'pending', points: 50, facultyName: 'Dr. Meena Kumari', facultyId: 5, department: 'CSE' },
  { id: 102, title: 'AWS Solutions Architect Certification', type: 'Certification', category: 'Professional Development', date: '2026-01-28', status: 'pending', points: 20, facultyName: 'Prof. Karthik R', facultyId: 6, department: 'IT' },
  { id: 103, title: 'Keynote at International AI Summit', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-30', status: 'pending', points: 25, facultyName: 'Dr. Lakshmi Priya', facultyId: 7, department: 'CSE' },
  { id: 104, title: 'Patent granted: Blockchain-based Voting System', type: 'Patent', category: 'Research', date: '2026-02-01', status: 'pending', points: 75, facultyName: 'Dr. Arun Kumar', facultyId: 8, department: 'ECE' },
  { id: 105, title: 'FDP on Quantum Computing - 5 days', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-25', status: 'pending', points: 20, facultyName: 'Prof. Divya S', facultyId: 9, department: 'EEE' },
  { id: 106, title: 'Organized Hackathon with 500+ participants', type: 'Event Organized', category: 'Service', date: '2026-02-07', status: 'pending', points: 30, facultyName: 'Dr. Ramesh B', facultyId: 10, department: 'CSE' },
  { id: 107, title: 'Industry project with Infosys on Edge AI', type: 'Consultancy', category: 'Industry', date: '2026-01-18', status: 'pending', points: 45, facultyName: 'Prof. Sathya N', facultyId: 11, department: 'IT' },
]

// ---- Faculty members (for HOD/Dean) ----
export const facultyMembers: FacultyMember[] = [
  { id: 1, name: 'Dr. Priya Sharma', email: 'priya@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 345, activitiesCount: 18, joinedDate: '2018-06-15' },
  { id: 2, name: 'Dr. Rajesh Kumar', email: 'rajesh@bit.edu', department: 'CSE', designation: 'Professor & HOD', totalPoints: 420, activitiesCount: 24, joinedDate: '2015-08-01' },
  { id: 3, name: 'Prof. Anitha Devi', email: 'anitha@bit.edu', department: 'CSE', designation: 'Assistant Professor', totalPoints: 210, activitiesCount: 12, joinedDate: '2020-01-10' },
  { id: 4, name: 'Dr. Suresh Babu', email: 'suresh@bit.edu', department: 'ECE', designation: 'Associate Professor', totalPoints: 380, activitiesCount: 20, joinedDate: '2016-03-20' },
  { id: 5, name: 'Dr. Meena Kumari', email: 'meena@bit.edu', department: 'CSE', designation: 'Professor', totalPoints: 510, activitiesCount: 28, joinedDate: '2012-07-01' },
  { id: 6, name: 'Prof. Karthik R', email: 'karthik@bit.edu', department: 'IT', designation: 'Assistant Professor', totalPoints: 180, activitiesCount: 10, joinedDate: '2021-06-15' },
  { id: 7, name: 'Dr. Lakshmi Priya', email: 'lakshmi@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 290, activitiesCount: 16, joinedDate: '2019-01-05' },
  { id: 8, name: 'Dr. Arun Kumar', email: 'arun@bit.edu', department: 'ECE', designation: 'Professor', totalPoints: 465, activitiesCount: 22, joinedDate: '2014-08-20' },
  { id: 9, name: 'Prof. Divya S', email: 'divya@bit.edu', department: 'EEE', designation: 'Assistant Professor', totalPoints: 150, activitiesCount: 8, joinedDate: '2022-01-10' },
  { id: 10, name: 'Dr. Ramesh B', email: 'ramesh@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 330, activitiesCount: 19, joinedDate: '2017-03-01' },
  { id: 11, name: 'Prof. Sathya N', email: 'sathya@bit.edu', department: 'IT', designation: 'Assistant Professor', totalPoints: 195, activitiesCount: 11, joinedDate: '2020-07-15' },
  { id: 12, name: 'Dr. Venkat K', email: 'venkat@bit.edu', department: 'MECH', designation: 'Professor', totalPoints: 400, activitiesCount: 21, joinedDate: '2013-06-01' },
]

// ---- Department stats (for Dean) ----
export const departmentStats: DepartmentStat[] = [
  { name: 'Computer Science & Engineering', shortName: 'CSE', facultyCount: 45, totalActivities: 312, avgPoints: 285, topPerformer: 'Dr. Meena Kumari', pendingApprovals: 8 },
  { name: 'Information Technology', shortName: 'IT', facultyCount: 30, totalActivities: 198, avgPoints: 245, topPerformer: 'Dr. Senthil Kumar', pendingApprovals: 5 },
  { name: 'Electronics & Communication', shortName: 'ECE', facultyCount: 38, totalActivities: 256, avgPoints: 260, topPerformer: 'Dr. Arun Kumar', pendingApprovals: 6 },
  { name: 'Electrical & Electronics', shortName: 'EEE', facultyCount: 28, totalActivities: 167, avgPoints: 220, topPerformer: 'Dr. Vani R', pendingApprovals: 3 },
  { name: 'Mechanical Engineering', shortName: 'MECH', facultyCount: 35, totalActivities: 210, avgPoints: 235, topPerformer: 'Dr. Venkat K', pendingApprovals: 4 },
  { name: 'Civil Engineering', shortName: 'CIVIL', facultyCount: 22, totalActivities: 134, avgPoints: 210, topPerformer: 'Dr. Pradeep N', pendingApprovals: 2 },
]

// ---- Monthly trends ----
export const monthlyTrends: MonthlyTrend[] = [
  { month: 'Sep 2025', activities: 42, points: 1250, approved: 38, pending: 4 },
  { month: 'Oct 2025', activities: 58, points: 1680, approved: 51, pending: 7 },
  { month: 'Nov 2025', activities: 65, points: 1920, approved: 55, pending: 10 },
  { month: 'Dec 2025', activities: 48, points: 1450, approved: 42, pending: 6 },
  { month: 'Jan 2026', activities: 72, points: 2150, approved: 60, pending: 12 },
  { month: 'Feb 2026', activities: 35, points: 980, approved: 22, pending: 13 },
]

// ---- Category breakdown ----
export const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Research', count: 145, percentage: 35, color: '#3b82f6' },
  { category: 'Teaching', count: 82, percentage: 20, color: '#10b981' },
  { category: 'Professional Development', count: 98, percentage: 24, color: '#f59e0b' },
  { category: 'Service', count: 45, percentage: 11, color: '#8b5cf6' },
  { category: 'Industry', count: 42, percentage: 10, color: '#ef4444' },
]

// ---- Quick stats per role ----
export const facultyStats = {
  totalActivities: 18,
  approved: 14,
  pending: 3,
  rejected: 1,
  totalPoints: 345,
  rank: 5,
  totalFaculty: 45,
  thisMonthActivities: 3,
  lastMonthActivities: 5,
  pointsTrend: +12, // percentage
}

export const hodStats = {
  departmentName: 'Computer Science & Engineering',
  totalFaculty: 45,
  activeFaculty: 42,
  totalActivities: 312,
  pendingApprovals: 8,
  avgPointsPerFaculty: 285,
  topPerformer: 'Dr. Meena Kumari',
  topPerformerPoints: 510,
  thisMonthActivities: 48,
  activitiesGrowth: +15,
}

export const deanStats = {
  totalDepartments: 6,
  totalFaculty: 198,
  totalActivities: 1277,
  totalPending: 28,
  avgPointsCollege: 248,
  topDepartment: 'CSE',
  topDepartmentPoints: 12825,
  researchOutput: 145,
  patentsFiled: 12,
}

export const verificationStats = {
  pendingReview: 7,
  reviewedToday: 4,
  reviewedThisWeek: 18,
  avgReviewTime: '1.2 days',
  approvalRate: 87,
  rejectionRate: 13,
}

export const adminStats = {
  totalUsers: 198,
  activeUsers: 185,
  newUsersThisMonth: 5,
  totalRoles: 5,
  systemUptime: '99.9%',
  lastBackup: '2026-02-10 02:00 AM',
  storageUsed: '2.4 GB / 10 GB',
  pendingRegistrations: 3,
}

// ---- Recent notifications ----
export const recentNotifications = [
  { id: 1, message: 'Your paper submission was approved (+50 pts)', time: '2 hours ago', type: 'success' as const },
  { id: 2, message: 'New FDP opportunity: AI in Education', time: '5 hours ago', type: 'info' as const },
  { id: 3, message: 'Deadline reminder: Submit Q4 activities by Feb 28', time: '1 day ago', type: 'warning' as const },
  { id: 4, message: 'Dr. Meena Kumari reached 500 points milestone!', time: '2 days ago', type: 'success' as const },
  { id: 5, message: 'System maintenance scheduled for Feb 15', time: '3 days ago', type: 'info' as const },
]

// ---- Leaderboard ----
export const leaderboard = [
  { rank: 1, name: 'Dr. Meena Kumari', department: 'CSE', points: 510, activities: 28, badge: 'gold' },
  { rank: 2, name: 'Dr. Arun Kumar', department: 'ECE', points: 465, activities: 22, badge: 'gold' },
  { rank: 3, name: 'Dr. Rajesh Kumar', department: 'CSE', points: 420, activities: 24, badge: 'silver' },
  { rank: 4, name: 'Dr. Venkat K', department: 'MECH', points: 400, activities: 21, badge: 'silver' },
  { rank: 5, name: 'Dr. Suresh Babu', department: 'ECE', points: 380, activities: 20, badge: 'silver' },
  { rank: 6, name: 'Dr. Priya Sharma', department: 'CSE', points: 345, activities: 18, badge: 'bronze' },
  { rank: 7, name: 'Dr. Ramesh B', department: 'CSE', points: 330, activities: 19, badge: 'bronze' },
  { rank: 8, name: 'Dr. Lakshmi Priya', department: 'CSE', points: 290, activities: 16, badge: 'bronze' },
  { rank: 9, name: 'Prof. Anitha Devi', department: 'CSE', points: 210, activities: 12, badge: 'none' },
  { rank: 10, name: 'Prof. Sathya N', department: 'IT', points: 195, activities: 11, badge: 'none' },
]

// ============================================================
// CHART-SPECIFIC DATA
// ============================================================

// ---- Faculty: weekly points progression ----
export const weeklyPointsData = [
  { week: 'W1', points: 45, activities: 3 },
  { week: 'W2', points: 70, activities: 4 },
  { week: 'W3', points: 30, activities: 2 },
  { week: 'W4', points: 95, activities: 5 },
  { week: 'W5', points: 60, activities: 3 },
  { week: 'W6', points: 110, activities: 6 },
  { week: 'W7', points: 85, activities: 4 },
  { week: 'W8', points: 50, activities: 3 },
]

// ---- Faculty: activity status distribution ----
export const activityStatusData = [
  { name: 'Approved', value: 14, color: '#10b981' },
  { name: 'Pending', value: 3, color: '#f59e0b' },
  { name: 'Rejected', value: 1, color: '#ef4444' },
]

// ---- Faculty: points goal tracker ----
export const pointsGoalData = [
  { month: 'Sep', actual: 45, target: 50 },
  { month: 'Oct', actual: 70, target: 50 },
  { month: 'Nov', actual: 55, target: 55 },
  { month: 'Dec', actual: 80, target: 60 },
  { month: 'Jan', actual: 65, target: 60 },
  { month: 'Feb', actual: 30, target: 65 },
]

// ---- Faculty: radar chart – skill dimensions ----
export const facultyRadarData = [
  { subject: 'Research', value: 85, fullMark: 100 },
  { subject: 'Teaching', value: 65, fullMark: 100 },
  { subject: 'Service', value: 50, fullMark: 100 },
  { subject: 'Industry', value: 70, fullMark: 100 },
  { subject: 'Development', value: 60, fullMark: 100 },
]

// ---- HOD: faculty performance scatter ----
export const facultyPerformanceData = [
  { name: 'Dr. Meena Kumari', activities: 28, points: 510 },
  { name: 'Dr. Rajesh Kumar', activities: 24, points: 420 },
  { name: 'Prof. Anitha Devi', activities: 12, points: 210 },
  { name: 'Dr. Lakshmi Priya', activities: 16, points: 290 },
  { name: 'Dr. Ramesh B', activities: 19, points: 330 },
  { name: 'Dr. Priya Sharma', activities: 18, points: 345 },
]

// ---- HOD: department category performance ----
export const deptCategoryData = [
  { category: 'Research', CSE: 95, IT: 72, ECE: 85, EEE: 60 },
  { category: 'Teaching', CSE: 70, IT: 65, ECE: 55, EEE: 75 },
  { category: 'Prof Dev', CSE: 80, IT: 90, ECE: 60, EEE: 50 },
  { category: 'Service', CSE: 55, IT: 40, ECE: 45, EEE: 35 },
  { category: 'Industry', CSE: 65, IT: 80, ECE: 70, EEE: 45 },
]

// ---- HOD: monthly approval funnel ----
export const approvalFunnelData = [
  { month: 'Oct', submitted: 58, reviewed: 52, approved: 51, rejected: 1 },
  { month: 'Nov', submitted: 65, reviewed: 58, approved: 55, rejected: 3 },
  { month: 'Dec', submitted: 48, reviewed: 45, approved: 42, rejected: 3 },
  { month: 'Jan', submitted: 72, reviewed: 65, approved: 60, rejected: 5 },
  { month: 'Feb', submitted: 35, reviewed: 28, approved: 22, rejected: 6 },
]

// ---- Dean: department comparison radar ----
export const deptRadarData = [
  { metric: 'Research', CSE: 95, IT: 72, ECE: 85, EEE: 60, MECH: 50, CIVIL: 40 },
  { metric: 'Teaching', CSE: 70, IT: 65, ECE: 55, EEE: 75, MECH: 60, CIVIL: 70 },
  { metric: 'Prof Dev', CSE: 80, IT: 90, ECE: 60, EEE: 50, MECH: 45, CIVIL: 55 },
  { metric: 'Service', CSE: 55, IT: 40, ECE: 45, EEE: 35, MECH: 65, CIVIL: 50 },
  { metric: 'Industry', CSE: 65, IT: 80, ECE: 70, EEE: 45, MECH: 75, CIVIL: 35 },
]

// ---- Dean: yearly comparison ----
export const yearlyComparisonData = [
  { month: 'Sep', thisYear: 1250, lastYear: 980 },
  { month: 'Oct', thisYear: 1680, lastYear: 1200 },
  { month: 'Nov', thisYear: 1920, lastYear: 1450 },
  { month: 'Dec', thisYear: 1450, lastYear: 1100 },
  { month: 'Jan', thisYear: 2150, lastYear: 1600 },
  { month: 'Feb', thisYear: 980, lastYear: 1350 },
]

// ---- Dean: activity type distribution across college ----
export const collegeActivityTypeData = [
  { type: 'Journal Papers', count: 82, color: '#3b82f6' },
  { type: 'Conference Papers', count: 63, color: '#6366f1' },
  { type: 'Patents', count: 12, color: '#8b5cf6' },
  { type: 'FDP/Workshops', count: 98, color: '#10b981' },
  { type: 'Certifications', count: 75, color: '#14b8a6' },
  { type: 'Guest Lectures', count: 45, color: '#f59e0b' },
  { type: 'Events Organized', count: 38, color: '#f97316' },
  { type: 'Consultancy', count: 42, color: '#ef4444' },
  { type: 'Mentoring', count: 55, color: '#ec4899' },
  { type: 'Book Chapters', count: 18, color: '#a855f7' },
]

// ---- Dean: faculty growth over semesters ----
export const facultyGrowthData = [
  { semester: '2022-I', active: 155, new: 12 },
  { semester: '2022-II', active: 162, new: 10 },
  { semester: '2023-I', active: 170, new: 14 },
  { semester: '2023-II', active: 178, new: 11 },
  { semester: '2024-I', active: 185, new: 13 },
  { semester: '2024-II', active: 192, new: 9 },
  { semester: '2025-I', active: 198, new: 8 },
]

// ---- Verification: daily review volume ----
export const dailyReviewData = [
  { day: 'Mon', reviewed: 6, approved: 5, rejected: 1 },
  { day: 'Tue', reviewed: 8, approved: 7, rejected: 1 },
  { day: 'Wed', reviewed: 4, approved: 3, rejected: 1 },
  { day: 'Thu', reviewed: 7, approved: 6, rejected: 1 },
  { day: 'Fri', reviewed: 5, approved: 5, rejected: 0 },
  { day: 'Sat', reviewed: 2, approved: 2, rejected: 0 },
  { day: 'Sun', reviewed: 0, approved: 0, rejected: 0 },
]

// ---- Verification: review time distribution ----
export const reviewTimeData = [
  { range: '< 1 hr', count: 12 },
  { range: '1-4 hrs', count: 28 },
  { range: '4-12 hrs', count: 18 },
  { range: '12-24 hrs', count: 8 },
  { range: '1-2 days', count: 5 },
  { range: '2+ days', count: 2 },
]

// ---- Verification: category-wise pending ----
export const categoryPendingData = [
  { category: 'Research', pending: 3, color: '#3b82f6' },
  { category: 'Teaching', pending: 1, color: '#10b981' },
  { category: 'Prof Dev', pending: 2, color: '#f59e0b' },
  { category: 'Service', pending: 0, color: '#8b5cf6' },
  { category: 'Industry', pending: 1, color: '#ef4444' },
]

// ---- Verification: weekly approval trend ----
export const weeklyApprovalTrend = [
  { week: 'W1', approved: 12, rejected: 2, pending: 3 },
  { week: 'W2', approved: 15, rejected: 1, pending: 5 },
  { week: 'W3', approved: 10, rejected: 3, pending: 4 },
  { week: 'W4', approved: 18, rejected: 2, pending: 7 },
]

// ---- Admin: user growth over time ----
export const userGrowthData = [
  { month: 'Jul 2025', users: 175, active: 162 },
  { month: 'Aug 2025', users: 180, active: 168 },
  { month: 'Sep 2025', users: 183, active: 171 },
  { month: 'Oct 2025', users: 188, active: 176 },
  { month: 'Nov 2025', users: 191, active: 180 },
  { month: 'Dec 2025', users: 193, active: 181 },
  { month: 'Jan 2026', users: 196, active: 184 },
  { month: 'Feb 2026', users: 198, active: 185 },
]

// ---- Admin: role distribution ----
export const roleDistributionData = [
  { role: 'Faculty', count: 165, color: '#3b82f6' },
  { role: 'HOD', count: 6, color: '#10b981' },
  { role: 'Dean', count: 2, color: '#8b5cf6' },
  { role: 'Verification', count: 8, color: '#f59e0b' },
  { role: 'Admin', count: 3, color: '#ef4444' },
]

// ---- Admin: activity volume by department ----
export const deptActivityVolumeData = [
  { dept: 'CSE', activities: 312, points: 12825 },
  { dept: 'IT', dept2: 'Information Tech', activities: 198, points: 7350 },
  { dept: 'ECE', activities: 256, points: 9880 },
  { dept: 'EEE', activities: 167, points: 6160 },
  { dept: 'MECH', activities: 210, points: 8225 },
  { dept: 'CIVIL', activities: 134, points: 4620 },
]

// ---- Admin: system health metrics ----
export const systemHealthData = [
  { hour: '00:00', cpu: 12, memory: 45, requests: 5 },
  { hour: '04:00', cpu: 8, memory: 42, requests: 2 },
  { hour: '08:00', cpu: 35, memory: 52, requests: 45 },
  { hour: '10:00', cpu: 68, memory: 65, requests: 120 },
  { hour: '12:00', cpu: 45, memory: 58, requests: 85 },
  { hour: '14:00', cpu: 72, memory: 68, requests: 150 },
  { hour: '16:00', cpu: 55, memory: 62, requests: 95 },
  { hour: '18:00', cpu: 30, memory: 50, requests: 40 },
  { hour: '20:00', cpu: 18, memory: 46, requests: 15 },
  { hour: '22:00', cpu: 10, memory: 44, requests: 8 },
]

// ---- Admin: monthly login stats ----
export const loginStatsData = [
  { month: 'Sep', logins: 1250, unique: 162 },
  { month: 'Oct', logins: 1480, unique: 170 },
  { month: 'Nov', logins: 1320, unique: 168 },
  { month: 'Dec', logins: 980, unique: 155 },
  { month: 'Jan', logins: 1550, unique: 178 },
  { month: 'Feb', logins: 820, unique: 160 },
]
