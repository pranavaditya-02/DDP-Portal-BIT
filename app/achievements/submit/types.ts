/**
 * Type definitions for Achievement Submission System
 * Organized by category for better maintainability
 */

// ============================================
// BASE TYPES
// ============================================

export interface BaseAchievementData {
  title: string
  description: string
  date: string
  image?: File
  imagePreview?: string
}

export interface FileUploadField {
  file?: File
  preview?: string
}

// ============================================
// EVENTS ATTENDED
// ============================================

export interface EventsAttendedData extends BaseAchievementData {
  taskId: string
  specialLabsInvolved: string
  specialLabName?: string
  eventType: string
  organizerType: string
  eventLevel: string
  eventTitle: string
  organizationSector: string
  eventOrganizer: string
  eventMode: string
  eventDuration: string
  eventDurationValue: string
  eventDate: string
  endDate: string
  durationInDays: string
  otherOrganizerName?: string
  sponsorshipType: string
  eventOutcome: string
  certificateProof?: File
  certificatePreview?: string
  geotagPhotos?: File
  geotagPreview?: string
}

// ============================================
// EVENTS ORGANIZED
// ============================================

export interface InternalFacultyMember {
  id: string
  name: string
  role: string
}

export interface StudentMember {
  id: string
  name: string
}

export interface GuestSpeaker {
  id: string
  type: string
  name: string
  designation: string
  email: string
  contact: string
  organization: string
}

export interface EventsOrganisedData extends BaseAchievementData {
  taskId: string
  facultyName: string
  facultyRole: string
  claimedDepartment: string
  specialLabsInvolved: string
  iicEvent: string
  iicEventUpload: string
  iicBipId: string
  deptAssociation: string
  rAndD: string
  technicalSociety: string
  mouOutcome: string
  mouBipId: string
  irpOutcome: string
  irpBipId: string
  coeOrganized: string
  coeBipId: string
  islOrganized: string
  islBipId: string
  internalFaculty: InternalFacultyMember[]
  students: StudentMember[]
  eventName: string
  eventType: string
  eventCategory: string
  programType: string
  eventMode: string
  startDate: string
  endDate: string
  eventDuration: string
  eventLevel: string
  jointlyOrganizedWith: string
  internalStudentParticipants: string
  internalFacultyParticipants: string
  externalStudentParticipants: string
  externalFacultyParticipants: string
  guestSpeakerType: string
  alumniGuestSpeaker: string
  guestSpeakers: GuestSpeaker[]
  registrationAmount: string
  sponsorshipAmount: string
  managementAmount: string
  fundingAgency: string
  totalRevenue: string
  proofFiles?: File[]
  proofFilePreviews?: string[]
}

// ============================================
// GUEST LECTURE DELIVERED
// ============================================

export interface GuestLectureDeliveredData extends BaseAchievementData {
  taskId: string
  faculty: string
  specialLabsInvolved: string
  specialLabName?: string
  eventType: string
  topic: string
  modeOfConduct: string
  eventLevel: string
  eventName: string
  fromDate: string
  toDate: string
  noOfDays: string
  typeOfOrganization: string
  noOfParticipants: string
  typeOfAudienceCovered: string
  documentProof?: File
  documentProofPreview?: string
  apexProof?: File
  apexProofPreview?: string
  samplePhotographs?: File
  samplePhotographsPreview?: string
  iqacVerification: string
}

// ============================================
// ONLINE COURSE
// ============================================

export interface OnlineCourseData extends BaseAchievementData {
  taskId: string
  courseName: string
  typeOfOrganizer: string
  organizationName: string
  organizationAddress: string
  levelOfEvent: string
  duration: string
  startDate: string
  endDate: string
  courseCategory: string
  gradeObtained: string
  typeOfSponsorship: string
  claimedFor: string
  certificateProof?: File
  certificateProofPreview?: string
  iqacVerification: string
}

// ============================================
// PAPER PRESENTATION
// ============================================

export interface PaperPresentationData extends BaseAchievementData {
  faculty: string
  taskId: string
  specialLabsInvolved: string
  specialLabName?: string
  otherAuthorsFromBIT: string
  firstAuthor?: string
  secondAuthor?: string
  thirdAuthor?: string
  fourthAuthor?: string
  fifthAuthor?: string
  externalFacultyInvolved: string
  externalFaculty1?: string
  externalFaculty1Institution?: string
  externalFaculty2?: string
  externalFaculty2Institution?: string
  externalFaculty3?: string
  externalFaculty3Institution?: string
  industrialPersonInvolved: string
  industrialPerson1?: string
  industrialPerson1Industry?: string
  industrialPerson2?: string
  industrialPerson2Industry?: string
  industrialPerson3?: string
  industrialPerson3Industry?: string
  internationalCollaboration: string
  internationalInstituteName?: string
  conferenceTitle: string
  eventMode: string
  eventOrganizer: string
  eventLevel: string
  paperTitle: string
  eventStartDate: string
  eventEndDate: string
  eventDurationDays: string
  paperPublishedInProceedings: string
  pageFrom?: string
  pageTo?: string
  typeOfSponsorship: string
  studentsInvolved: string
  firstStudent?: string
  firstStudentYear?: string
  secondStudent?: string
  secondStudentYear?: string
  thirdStudent?: string
  thirdStudentYear?: string
  fourthStudent?: string
  fourthStudentYear?: string
  fifthStudent?: string
  fifthStudentYear?: string
  registrationAmount: string
  documentProof?: File
  documentProofPreview?: string
  awardPrizeReceived: string
  awardProof?: File
  awardProofPreview?: string
  iqacVerification: string
}

// ============================================
// UNION TYPE FOR ALL ACHIEVEMENTS
// ============================================

export type AchievementDataType =
  | EventsAttendedData
  | EventsOrganisedData
  | GuestLectureDeliveredData
  | OnlineCourseData
  | PaperPresentationData
  | Record<string, any> // For generic achievements without specific data

// ============================================
// ACHIEVEMENT ENTITY
// ============================================

export interface Achievement {
  id: string
  category: string
  title: string
  description: string
  date: string
  image?: File
  imagePreview?: string
  eventsAttendedData?: EventsAttendedData
  eventsOrganisedData?: EventsOrganisedData
  guestLectureDeliveredData?: GuestLectureDeliveredData
  onlineCourseData?: OnlineCourseData
  paperPresentationData?: PaperPresentationData
}

// ============================================
// FORM HANDLER TYPES
// ============================================

export type FormChangeHandler = (
  achievementId: string,
  field: string,
  value: string | File
) => void

export interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select'
  options?: { label: string; value: string }[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface SubmissionResponse extends ApiResponse {
  achievementId?: string
  submissionId?: string
}
