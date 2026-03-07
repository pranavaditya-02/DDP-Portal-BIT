/**
 * Custom hook for managing achievement form state and handlers
 */

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Achievement, AchievementDataType } from '../types'

/**
 * Hook for comprehensive achievement form management
 * Handles state, validation, file uploads, and event handlers
 */
export const useAchievementForm = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      category: '',
      title: '',
      date: '',
      description: '',
    },
  ])

  /**
   * Generic handler for achievement-level field changes
   * Handles both regular inputs and file uploads with preview generation
   */
  const handleAchievementChange = (
    id: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === id) {
        if (field === 'image' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === id
                  ? {
                      ...item,
                      image: value,
                      imagePreview: reader.result as string,
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }
        return { ...a, [field]: value }
      }
      return a
    }))
  }

  /**
   * Handler for Events Attended form changes
   * Manages file uploads with preview generation for certificate and photos
   */
  const handleEventDataChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsAttendedData || {
          title: '',
          description: '',
          date: '',
          taskId: '',
          specialLabsInvolved: '',
          eventType: '',
          organizerType: '',
          eventLevel: '',
          eventTitle: '',
          organizationSector: '',
          eventOrganizer: '',
          eventMode: '',
          eventDuration: '',
          eventDurationValue: '',
          eventDate: '',
          endDate: '',
          durationInDays: '',
          sponsorshipType: '',
          eventOutcome: '',
          certificatePreview: '',
          geotagPreview: '',
        }

        if ((field === 'certificateProof' || field === 'geotagPhotos') && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      eventsAttendedData: {
                        ...eventData,
                        [field]: value,
                        [field === 'certificateProof' ? 'certificatePreview' : 'geotagPreview']: reader.result as string,
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          eventsAttendedData: { ...eventData, [field]: value },
        }
      }
      return a
    }))
  }

  /**
   * Handler for Events Organized form changes
   * Complex form with nested arrays and file management
   */
  const handleEventsOrganisedChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData || {
          title: '',
          description: '',
          date: '',
          taskId: '',
          facultyName: '',
          facultyRole: '',
          claimedDepartment: '',
          specialLabsInvolved: '',
          iicEvent: '',
          iicEventUpload: '',
          iicBipId: '',
          deptAssociation: '',
          rAndD: '',
          technicalSociety: '',
          mouOutcome: '',
          mouBipId: '',
          irpOutcome: '',
          irpBipId: '',
          coeOrganized: '',
          coeBipId: '',
          islOrganized: '',
          islBipId: '',
          internalFaculty: [],
          students: [],
          eventName: '',
          eventType: '',
          eventCategory: '',
          programType: '',
          eventMode: '',
          startDate: '',
          endDate: '',
          eventDuration: '',
          eventLevel: '',
          jointlyOrganizedWith: '',
          internalStudentParticipants: '',
          internalFacultyParticipants: '',
          externalStudentParticipants: '',
          externalFacultyParticipants: '',
          guestSpeakerType: '',
          alumniGuestSpeaker: '',
          guestSpeakers: [],
          registrationAmount: '',
          sponsorshipAmount: '',
          managementAmount: '',
          fundingAgency: '',
          totalRevenue: '',
          proofFiles: [],
          proofFilePreviews: [],
        }

        if (field === 'proofFiles' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      eventsOrganisedData: {
                        ...eventData,
                        proofFiles: [...(eventData.proofFiles || []), value],
                        proofFilePreviews: [...(eventData.proofFilePreviews || []), reader.result as string],
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          eventsOrganisedData: { ...eventData, [field]: value },
        }
      }
      return a
    }))
  }

  // ============================================
  // EVENTS ORGANIZED - Internal Faculty Management
  // ============================================

  const addInternalFacultyMember = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: [...eventData.internalFaculty, { id: Date.now().toString(), name: '', role: '' }],
          },
        }
      }
      return a
    }))
  }

  const removeInternalFacultyMember = (achievementId: string, memberId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: eventData.internalFaculty.filter(f => f.id !== memberId),
          },
        }
      }
      return a
    }))
  }

  const updateInternalFacultyMember = (achievementId: string, memberId: string, field: string, value: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: eventData.internalFaculty.map(f =>
              f.id === memberId ? { ...f, [field]: value } : f
            ),
          },
        }
      }
      return a
    }))
  }

  // ============================================
  // EVENTS ORGANIZED - Student Management
  // ============================================

  const addStudentMember = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: [...eventData.students, { id: Date.now().toString(), name: '' }],
          },
        }
      }
      return a
    }))
  }

  const removeStudentMember = (achievementId: string, studentId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: eventData.students.filter(s => s.id !== studentId),
          },
        }
      }
      return a
    }))
  }

  const updateStudentMember = (achievementId: string, studentId: string, name: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: eventData.students.map(s =>
              s.id === studentId ? { ...s, name } : s
            ),
          },
        }
      }
      return a
    }))
  }

  // ============================================
  // EVENTS ORGANIZED - Guest Speaker Management
  // ============================================

  const addGuestSpeaker = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: [...eventData.guestSpeakers, {
              id: Date.now().toString(),
              type: '',
              name: '',
              designation: '',
              email: '',
              contact: '',
              organization: '',
            }],
          },
        }
      }
      return a
    }))
  }

  const removeGuestSpeaker = (achievementId: string, speakerId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: eventData.guestSpeakers.filter(g => g.id !== speakerId),
          },
        }
      }
      return a
    }))
  }

  const updateGuestSpeaker = (achievementId: string, speakerId: string, field: string, value: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: eventData.guestSpeakers.map(g =>
              g.id === speakerId ? { ...g, [field]: value } : g
            ),
          },
        }
      }
      return a
    }))
  }

  const removeProofFile = (achievementId: string, index: number) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            proofFiles: eventData.proofFiles?.filter((_, i) => i !== index) || [],
            proofFilePreviews: eventData.proofFilePreviews?.filter((_, i) => i !== index) || [],
          },
        }
      }
      return a
    }))
  }

  /**
   * Handler for Guest Lecture form changes
   * Manages file uploads with preview generation
   */
  const handleGuestLectureChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const lectureData = a.guestLectureDeliveredData || {
          title: '',
          description: '',
          date: '',
          taskId: '',
          faculty: '',
          specialLabsInvolved: '',
          eventType: '',
          topic: '',
          modeOfConduct: '',
          eventLevel: '',
          eventName: '',
          fromDate: '',
          toDate: '',
          noOfDays: '',
          typeOfOrganization: '',
          noOfParticipants: '',
          typeOfAudienceCovered: '',
          iqacVerification: '',
          documentProofPreview: '',
          apexProofPreview: '',
          samplePhotographsPreview: '',
        }

        if ((field === 'documentProof' || field === 'apexProof' || field === 'samplePhotographs') && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      guestLectureDeliveredData: {
                        ...lectureData,
                        [field]: value,
                        [field === 'documentProof' ? 'documentProofPreview' : 
                         field === 'apexProof' ? 'apexProofPreview' : 
                         'samplePhotographsPreview']: reader.result as string,
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          guestLectureDeliveredData: { ...lectureData, [field]: value },
        }
      }
      return a
    }))
  }

  /**
   * Handler for Online Course form changes
   * Manages file uploads with preview generation for certificate
   */
  const handleOnlineCourseChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const courseData = a.onlineCourseData || {
          title: '',
          description: '',
          date: '',
          taskId: '',
          courseName: '',
          typeOfOrganizer: '',
          organizationName: '',
          organizationAddress: '',
          levelOfEvent: '',
          duration: '',
          startDate: '',
          endDate: '',
          courseCategory: '',
          gradeObtained: '',
          typeOfSponsorship: '',
          claimedFor: '',
          iqacVerification: '',
          certificateProofPreview: '',
        }

        if (field === 'certificateProof' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      onlineCourseData: {
                        ...courseData,
                        [field]: value,
                        certificateProofPreview: reader.result as string,
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          onlineCourseData: { ...courseData, [field]: value },
        }
      }
      return a
    }))
  }

  /**
   * Handler for Paper Presentation form changes
   * Manages file uploads with preview generation for document and award proof
   */
  const handlePaperPresentationChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const papData = a.paperPresentationData || {
          title: '',
          description: '',
          date: '',
          faculty: '',
          taskId: '',
          specialLabsInvolved: '',
          otherAuthorsFromBIT: '',
          externalFacultyInvolved: '',
          industrialPersonInvolved: '',
          internationalCollaboration: '',
          conferenceTitle: '',
          eventMode: '',
          eventOrganizer: '',
          eventLevel: '',
          paperTitle: '',
          eventStartDate: '',
          eventEndDate: '',
          eventDurationDays: '',
          paperPublishedInProceedings: '',
          typeOfSponsorship: '',
          studentsInvolved: '',
          registrationAmount: '',
          awardPrizeReceived: '',
          iqacVerification: '',
          documentProofPreview: '',
          awardProofPreview: '',
        }

        if ((field === 'documentProof' || field === 'awardProof') && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      paperPresentationData: {
                        ...papData,
                        [field]: value,
                        [field === 'documentProof' ? 'documentProofPreview' : 'awardProofPreview']: reader.result as string,
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          paperPresentationData: { ...papData, [field]: value },
        }
      }
      return a
    }))
  }

  /**
   * Add a new achievement form
   */
  const addAchievement = () => {
    const newId = Date.now().toString()
    setAchievements([...achievements, {
      id: newId,
      category: '',
      title: '',
      date: '',
      description: '',
    }])
  }

  /**
   * Remove an achievement form
   */
  const removeAchievement = (id: string) => {
    if (achievements.length === 1) {
      toast.error('You must have at least one achievement')
      return
    }
    setAchievements(achievements.filter(a => a.id !== id))
    toast.success('Achievement removed')
  }

  return {
    // State
    achievements,
    setAchievements,
    
    // Achievement-level handlers
    handleAchievementChange,
    addAchievement,
    removeAchievement,
    
    // Events Attended handlers
    handleEventDataChange,
    
    // Events Organized handlers
    handleEventsOrganisedChange,
    addInternalFacultyMember,
    removeInternalFacultyMember,
    updateInternalFacultyMember,
    addStudentMember,
    removeStudentMember,
    updateStudentMember,
    addGuestSpeaker,
    removeGuestSpeaker,
    updateGuestSpeaker,
    removeProofFile,
    
    // Guest Lecture handlers
    handleGuestLectureChange,
    
    // Online Course handlers
    handleOnlineCourseChange,
    
    // Paper Presentation handlers
    handlePaperPresentationChange,
  }
}
