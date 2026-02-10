import bcrypt from 'bcrypt';
import { prisma } from '../database/client';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthService {
  async register(email: string, password: string, name: string, employeeId: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          employeeId,
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      logger.info(`User registered: ${email}`);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            where: { isActive: true },
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Extract roles
      const roles = user.userRoles.map((ur) => ur.role.roleName);

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        roles,
        departmentId: user.departmentId || undefined,
      });

      logger.info(`User logged in: ${email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
          departmentId: user.departmentId,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getUserWithRoles(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            where: { isActive: true },
            include: {
              role: true,
              department: true,
            },
          },
          department: true,
        },
      });

      if (!user) {
        return null;
      }

      const roles = user.userRoles.map((ur) => ur.role.roleName);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        departmentId: user.departmentId,
        userRoles: user.userRoles,
      };
    } catch (error) {
      logger.error('Error fetching user with roles:', error);
      throw error;
    }
  }

  async verifyTokenAndGetUser(token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: token },
        include: {
          userRoles: {
            where: { isActive: true },
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const roles = user.userRoles.map((ur) => ur.role.roleName);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        departmentId: user.departmentId,
      };
    } catch (error) {
      logger.error('Error verifying token:', error);
      return null;
    }
  }
}

export default new AuthService();
