/**
 * Achievement Service - API integration layer
 * Handles all backend communication for achievement submissions
 */

import { Achievement, AchievementDataType } from '../types'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface SubmissionPayload {
  userId: string
  achievements: Achievement[]
  submittedAt: string
}

/**
 * Submit achievements to the backend
 * @param achievements - Array of achievements to submit
 * @param userId - User ID from authentication store
 * @returns Promise with API response
 */
export const submitAchievements = async (
  achievements: Achievement[],
  userId: string
): Promise<ApiResponse<{ submissionId: string }>> => {
  try {
    const payload: SubmissionPayload = {
      userId,
      achievements,
      submittedAt: new Date().toISOString(),
    }

    const response = await fetch('/api/achievements/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to submit achievements',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.data,
      message: 'Achievements submitted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Validate achievement before submission
 * Performs basic validations on achievement structure and data
 * @param achievement - Achievement to validate
 * @returns Object containing validation status and errors
 */
export const validateAchievement = (achievement: Achievement): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  // Validate basic fields
  if (!achievement.category) {
    errors.push('Achievement category is required')
  }
  if (!achievement.title) {
    errors.push('Achievement title is required')
  }
  if (!achievement.date) {
    errors.push('Achievement date is required')
  }

  // Validate category-specific data
  if (achievement.category === 'Events Attended' && achievement.eventsAttendedData) {
    const data = achievement.eventsAttendedData
    if (!data.taskId) errors.push('Task ID is required for Events Attended')
    if (!data.eventType) errors.push('Event type is required for Events Attended')
    if (!data.organizerType) errors.push('Organizer type is required for Events Attended')
    if (!data.eventLevel) errors.push('Event level is required for Events Attended')
    if (!data.eventTitle) errors.push('Event title is required for Events Attended')
    if (!data.organizationSector) errors.push('Organization sector is required for Events Attended')
    if (!data.eventOrganizer) errors.push('Event organizer is required for Events Attended')
    if (!data.eventMode) errors.push('Event mode is required for Events Attended')
    if (!data.sponsorshipType) errors.push('Sponsorship type is required for Events Attended')
    if (!data.eventOutcome) errors.push('Event outcome is required for Events Attended')
  }

  if (achievement.category === 'Events Organized' && achievement.eventsOrganisedData) {
    const data = achievement.eventsOrganisedData
    if (!data.taskId) errors.push('Task ID is required for Events Organized')
    if (!data.eventName) errors.push('Event name is required for Events Organized')
    if (!data.eventType) errors.push('Event type is required for Events Organized')
    if (!data.startDate) errors.push('Start date is required for Events Organized')
    if (!data.endDate) errors.push('End date is required for Events Organized')
  }

  if (achievement.category === 'Guest Lecture Delivered' && achievement.guestLectureDeliveredData) {
    const data = achievement.guestLectureDeliveredData
    if (!data.taskId) errors.push('Task ID is required for Guest Lecture')
    if (!data.eventType) errors.push('Event type is required for Guest Lecture')
    if (!data.fromDate) errors.push('From date is required for Guest Lecture')
    if (!data.toDate) errors.push('To date is required for Guest Lecture')
  }

  if (achievement.category === 'Online Course' && achievement.onlineCourseData) {
    const data = achievement.onlineCourseData
    if (!data.taskId) errors.push('Task ID is required for Online Course')
    if (!data.courseName) errors.push('Course name is required for Online Course')
    if (!data.startDate) errors.push('Start date is required for Online Course')
    if (!data.endDate) errors.push('End date is required for Online Course')
  }

  if (achievement.category === 'Paper Presentation' && achievement.paperPresentationData) {
    const data = achievement.paperPresentationData
    if (!data.taskId) errors.push('Task ID is required for Paper Presentation')
    if (!data.paperTitle) errors.push('Paper title is required for Paper Presentation')
    if (!data.conferenceTitle) errors.push('Conference title is required for Paper Presentation')
    if (!data.eventStartDate) errors.push('Event start date is required for Paper Presentation')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get achievement submission history
 * Fetches previous submissions for a user
 * @param userId - User ID to get history for
 * @returns Promise with submission history
 */
export const getSubmissionHistory = async (userId: string): Promise<ApiResponse<Achievement[]>> => {
  try {
    const response = await fetch(`/api/achievements/history?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to fetch submission history',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.achievements,
      message: 'Submission history fetched successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Update a previously submitted achievement
 * Only allowed before approval
 * @param submissionId - Submission ID to update
 * @param updates - Partial achievement data to update
 * @returns Promise with API response
 */
export const updateAchievement = async (
  submissionId: string,
  updates: Partial<Achievement>
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/achievements/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to update achievement',
      }
    }

    return {
      success: true,
      message: 'Achievement updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Delete a submitted achievement
 * Only allowed before approval
 * @param submissionId - Submission ID to delete
 * @returns Promise with API response
 */
export const deleteAchievement = async (submissionId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/achievements/${submissionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to delete achievement',
      }
    }

    return {
      success: true,
      message: 'Achievement deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Get achievement status
 * Fetches the current status of a submitted achievement
 * @param submissionId - Submission ID to check
 * @returns Promise with status information
 */
export const getAchievementStatus = async (submissionId: string): Promise<ApiResponse<{
  status: 'pending' | 'approved' | 'rejected'
  approverComments?: string
  updatedAt: string
}>> => {
  try {
    const response = await fetch(`/api/achievements/${submissionId}/status`, {
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to fetch achievement status',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.status,
      message: 'Achievement status fetched successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}
