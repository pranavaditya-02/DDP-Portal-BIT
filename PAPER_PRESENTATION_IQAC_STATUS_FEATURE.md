# Paper Presentation IQAC Status Update Feature

## Overview
This document describes the implementation of the IQAC status update feature for student paper presentations with email notifications and rejection remarks.

## Changes Made

### 1. Backend Route Enhancement
**File:** `backend/src/routes/studentPaperPresentation.routes.ts`

Updated the `PUT /api/student-paper-presentations/:id/iqac-status` endpoint to:
- Fetch the paper presentation record with student email using `getPresentationByIdWithEmail()`
- Accept optional `iqacRejectionRemarks` parameter in request body
- Store rejection remarks when status is set to 'completed' (rejected)
- Send email notifications to students with:
  - APPROVED status when `iqacVerification` is 'processing'
  - REJECTED status when `iqacVerification` is 'completed'
  - Reason for rejection (if provided) in both text and HTML emails

### 2. Service Layer Updates
**File:** `backend/src/services/studentPaperPresentation.service.ts`

#### Updated Interface
Added `iqacRejectionRemarks` field to `StudentPaperPresentationData`:
```typescript
export interface StudentPaperPresentationData {
  // ... existing fields
  iqacRejectionRemarks?: string;
}
```

#### Updated Conversion Function
Added mapping for `iqac_rejection_remarks` in `convertToCamelCase()` function to properly handle the new field when fetching data from the database.

#### Existing Methods
- `getPresentationByIdWithEmail()` - Already implemented to fetch student email from users table
- `updatePresentation()` - Already handles dynamic field updates via snake_case conversion

### 3. Database Migration
**File:** `backend/migrations/005_create_student_paper_presentations_table.sql`

Created migration to establish the `student_paper_presentations` table with:
- `iqac_rejection_remarks` TEXT field for storing rejection reasons
- Proper indexes for optimal query performance
- Foreign key constraints for data integrity

### 4. Frontend (Already Implemented)
**File:** `app/student/paper-presentation/page.tsx`

The frontend already has complete support for this feature:
- `RejectionModal` component for collecting rejection remarks from IQAC admins/reviewers
- `handleRejectRecord()` function sends rejection with remarks to backend
- `handleApproveRecord()` function sends approval status to backend
- UI displays rejection remarks alongside status updates

## API Endpoint

### Update IQAC Status
```http
PUT /api/student-paper-presentations/:id/iqac-status
Content-Type: application/json

{
  "iqacVerification": "processing" | "completed" | "initiated",
  "iqacRejectionRemarks": "Optional rejection reason when status is 'completed'"
}
```

### Response
```json
{
  "success": true,
  "message": "IQAC status updated successfully",
  "iqacVerification": "processing"
}
```

## Email Notifications

### Upon Approval (iqacVerification: 'processing')
- **Subject:** `Paper Presentation Submission APPROVED - BannariAmman College`
- **Body:** Includes paper title, ID, and confirmation of approval

### Upon Rejection (iqacVerification: 'completed')
- **Subject:** `Paper Presentation Submission REJECTED - BannariAmman College`
- **Body:** Includes paper title, ID, and specific rejection reason (if provided)

## Email Configuration

Ensure the following environment variables are set in your `.env` file:
```
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email@domain.com>
SMTP_PASSWORD=<your-app-password>
INTERNSHIP_SMTP_FROM=<sender-email@domain.com>
```

Or use the alternative `INTERNSHIP_SMTP_*` variables:
```
INTERNSHIP_SMTP_HOST=<your-smtp-host>
INTERNSHIP_SMTP_PORT=587
INTERNSHIP_SMTP_USER=<your-email@domain.com>
INTERNSHIP_SMTP_PASSWORD=<your-app-password>
INTERNSHIP_SMTP_FROM=<sender-email@domain.com>
```

## Workflow

1. **Student Submits Paper Presentation:** Record created with `iqacVerification: 'initiated'`
2. **IQAC Admin Reviews:** Admin opens paper presentation record in frontend
3. **Admin Approves (Optional Step):** 
   - Sets status to 'processing'
   - Email sent: "Paper Presentation Submission APPROVED"
4. **Admin Takes Final Action:**
   - **If Approved:** Sets status to 'completed' without rejection remarks
   - **If Rejected:** Sets status to 'completed' with rejection remarks
   - Email sent with appropriate message and reason (if rejected)
5. **Student Receives Email:** Receives approval/rejection notification with details

## Status Values
- `initiated` - Initial state, awaiting review
- `processing` - Under review / Approval in progress
- `completed` - Final decision made (approved or rejected based on presence of remarks)

## Error Handling
- If student email is not found, status update proceeds but email sending fails gracefully with logging
- If email sending fails, the status is still updated successfully
- Validation ensures only valid status values are accepted
- Record existence is verified before processing

## Testing the Feature

### Manual Testing Steps
1. Create a paper presentation record
2. Send IQAC status update request with approval:
   ```
   PUT /api/student-paper-presentations/1/iqac-status
   {"iqacVerification": "processing"}
   ```
3. Send rejection with remarks:
   ```
   PUT /api/student-paper-presentations/1/iqac-status
   {
     "iqacVerification": "completed",
     "iqacRejectionRemarks": "Paper quality does not meet standards"
   }
   ```
4. Verify emails are sent to the student's registered email address
5. Check backend logs for email sending confirmation

## Notes
- Email sending is non-blocking - if email fails, the API still returns success and logs the error
- Rejection remarks are optional and only stored when status is 'completed'
- The feature integrates with existing email infrastructure (nodemailer + SMTP)
- Student email is fetched from the users table using the student_id
