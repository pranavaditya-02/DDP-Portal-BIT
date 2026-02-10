import { prisma } from '../database/client';
import { logger } from '../utils/logger';

export class ActivityService {
  // Faculty: Get their own activities only
  async getFacultyActivities(facultyId: number) {
    try {
      const activities = await prisma.facultyActivity.findMany({
        where: { facultyId },
        include: {
          activityType: true,
          publication: true,
          event: true,
          verifiedByUser: {
            select: { name: true, email: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });
      return activities;
    } catch (error) {
      logger.error('Error fetching faculty activities:', error);
      throw error;
    }
  }

  // Verification Team: Get all pending activities
  async getPendingActivities(departmentId?: number) {
    try {
      const where = {
        status: 'pending',
        ...(departmentId && {
          faculty: {
            departmentId,
          },
        }),
      };

      const activities = await prisma.facultyActivity.findMany({
        where,
        include: {
          faculty: true,
          activityType: true,
          publication: true,
          event: true,
        },
        orderBy: { submittedAt: 'asc' },
      });
      return activities;
    } catch (error) {
      logger.error('Error fetching pending activities:', error);
      throw error;
    }
  }

  // HOD/Dean: Get department/college activities
  async getDepartmentActivities(departmentId?: number, academicYear?: string) {
    try {
      const where = {
        ...(departmentId && {
          faculty: {
            departmentId,
          },
        }),
        ...(academicYear && {
          activityDate: {
            gte: new Date(`${academicYear.split('-')[0]}-01-01`),
            lt: new Date(`${Number(academicYear.split('-')[0]) + 1}-01-01`),
          },
        }),
      };

      const activities = await prisma.facultyActivity.findMany({
        where,
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              email: true,
              departmentId: true,
            },
          },
          activityType: true,
          publication: true,
          event: true,
        },
        orderBy: { activityDate: 'desc' },
      });
      return activities;
    } catch (error) {
      logger.error('Error fetching department activities:', error);
      throw error;
    }
  }

  // Submit new activity (Faculty)
  async submitActivity(facultyId: number, data: {
    activityTypeId: number;
    title: string;
    description: string;
    activityDate: Date;
    proofDocumentPath?: string;
    additionalData?: Record<string, any>;
  }) {
    try {
      const activity = await prisma.facultyActivity.create({
        data: {
          facultyId,
          activityTypeId: data.activityTypeId,
          title: data.title,
          description: data.description,
          activityDate: data.activityDate,
          proofDocumentPath: data.proofDocumentPath,
          additionalData: data.additionalData,
          status: 'pending',
        },
        include: {
          activityType: true,
          faculty: true,
        },
      });

      logger.info(`Activity submitted by faculty ${facultyId}: ${activity.id}`);
      return activity;
    } catch (error) {
      logger.error('Error submitting activity:', error);
      throw error;
    }
  }

  // Approve activity (Verification Team)
  async approveActivity(activityId: number, verifiedBy: number, pointsEarned: number) {
    try {
      const activity = await prisma.facultyActivity.update({
        where: { id: activityId },
        data: {
          status: 'approved',
          verifiedBy,
          verifiedAt: new Date(),
          pointsEarned,
        },
        include: {
          faculty: true,
          activityType: true,
        },
      });

      logger.info(`Activity approved: ${activityId} by ${verifiedBy}`);
      return activity;
    } catch (error) {
      logger.error('Error approving activity:', error);
      throw error;
    }
  }

  // Reject activity (Verification Team)
  async rejectActivity(activityId: number, verifiedBy: number, rejectionReason: string) {
    try {
      const activity = await prisma.facultyActivity.update({
        where: { id: activityId },
        data: {
          status: 'rejected',
          verifiedBy,
          verifiedAt: new Date(),
          rejectionReason,
        },
        include: {
          faculty: true,
          activityType: true,
        },
      });

      logger.info(`Activity rejected: ${activityId} by ${verifiedBy}`);
      return activity;
    } catch (error) {
      logger.error('Error rejecting activity:', error);
      throw error;
    }
  }

  // Get activity statistics
  async getActivityStats(departmentId?: number, academicYear?: string) {
    try {
      const where = {
        ...(departmentId && {
          faculty: {
            departmentId,
          },
        }),
        ...(academicYear && {
          activityDate: {
            gte: new Date(`${academicYear.split('-')[0]}-01-01`),
            lt: new Date(`${Number(academicYear.split('-')[0]) + 1}-01-01`),
          },
        }),
      };

      const [total, approved, pending, rejected] = await Promise.all([
        prisma.facultyActivity.count({ where }),
        prisma.facultyActivity.count({ where: { ...where, status: 'approved' } }),
        prisma.facultyActivity.count({ where: { ...where, status: 'pending' } }),
        prisma.facultyActivity.count({ where: { ...where, status: 'rejected' } }),
      ]);

      const totalPoints = await prisma.facultyActivity.aggregate({
        where: { ...where, status: 'approved' },
        _sum: { pointsEarned: true },
      });

      return {
        total,
        approved,
        pending,
        rejected,
        totalPoints: totalPoints._sum.pointsEarned || 0,
      };
    } catch (error) {
      logger.error('Error fetching activity statistics:', error);
      throw error;
    }
  }
}

export default new ActivityService();
