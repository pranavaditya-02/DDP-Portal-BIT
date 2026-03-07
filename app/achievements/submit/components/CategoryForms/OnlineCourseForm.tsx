/**
 * Online Course Form Component
 * Handles online course achievement submissions
 */

import React from 'react'
import { Achievement } from '../../types'
import { TextInput, SelectInput, FileUpload, DateInput } from '../FormFields'
import {
  ONLINE_COURSE_OPTIONS,
  COMMON_OPTIONS,
} from '../../constants'

interface OnlineCourseFormProps {
  achievement: Achievement
  onChange: (field: string, value: string | File) => void
}

export const OnlineCourseForm: React.FC<OnlineCourseFormProps> = ({ achievement, onChange }) => {
  const data = achievement.onlineCourseData || {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const handleFileChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onChange(fieldName, e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="form-section-primary">
        <h3 className="text-lg font-bold text-blue-900">Online Course</h3>
        <p className="text-sm text-gray-600 mt-1">Provide details about the online course you completed</p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <TextInput
          label="Task ID"
          name="taskId"
          value={data.taskId}
          onChange={handleChange}
          placeholder="Enter task ID"
          required
        />

        <TextInput
          label="Course Name"
          name="courseName"
          value={data.courseName}
          onChange={handleChange}
          placeholder="Enter course name"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Type of Organizer"
            name="typeOfOrganizer"
            value={data.typeOfOrganizer}
            onChange={handleChange}
            options={ONLINE_COURSE_OPTIONS.ORGANIZERS}
            required
          />
          <TextInput
            label="Organization Name"
            name="organizationName"
            value={data.organizationName}
            onChange={handleChange}
            placeholder="Enter organization name"
            required
          />
        </div>

        <TextInput
          label="Organization Address"
          name="organizationAddress"
          value={data.organizationAddress}
          onChange={handleChange}
          placeholder="Enter organization address"
        />
      </div>

      {/* Course Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Level of Event"
            name="levelOfEvent"
            value={data.levelOfEvent}
            onChange={handleChange}
            options={ONLINE_COURSE_OPTIONS.LEVELS}
            required
          />
          <SelectInput
            label="Duration"
            name="duration"
            value={data.duration}
            onChange={handleChange}
            options={ONLINE_COURSE_OPTIONS.DURATIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            label="Start Date"
            name="startDate"
            value={data.startDate}
            onChange={handleChange}
            required
          />
          <DateInput
            label="End Date"
            name="endDate"
            value={data.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Performance and Category */}
      <div className="space-y-4">
        <SelectInput
          label="Course Category"
          name="courseCategory"
          value={data.courseCategory}
          onChange={handleChange}
          options={ONLINE_COURSE_OPTIONS.CATEGORIES}
          required
        />

        <TextInput
          label="Grade/Score Obtained"
          name="gradeObtained"
          value={data.gradeObtained}
          onChange={handleChange}
          placeholder="Enter grade or percentage"
        />
      </div>

      {/* Sponsorship and Claims */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Type of Sponsorship"
            name="typeOfSponsorship"
            value={data.typeOfSponsorship}
            onChange={handleChange}
            options={ONLINE_COURSE_OPTIONS.SPONSORSHIP_TYPES}
            required
          />
          <SelectInput
            label="Claimed For"
            name="claimedFor"
            value={data.claimedFor}
            onChange={handleChange}
            options={ONLINE_COURSE_OPTIONS.CLAIMED_FOR_OPTIONS}
            required
          />
        </div>
      </div>

      {/* Certificate Upload */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Certificate</h4>
        <FileUpload
          label="Certificate Proof"
          name="certificateProof"
          onChange={handleFileChange('certificateProof')}
          preview={data.certificateProofPreview}
          accept="application/pdf,image/*"
          required
        />
      </div>

      {/* IQAC Verification */}
      <div className="border-t pt-6">
        <SelectInput
          label="IQAC Verification"
          name="iqacVerification"
          value={data.iqacVerification}
          onChange={handleChange}
          options={COMMON_OPTIONS.YES_NO}
          required
        />
      </div>
    </div>
  )
}
