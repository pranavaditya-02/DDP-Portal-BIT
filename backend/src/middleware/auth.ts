import type { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import sessionService from '../services/session.service';
import rolesService from '../services/roles.service';

export const AUTH_COOKIE_NAME = 'ddp_auth_token';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
    roles: string[];
    facultyId?: string | null;
  };
}

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: number;
  roleName: string;
  roles: string[];
  facultyId?: string | null;
  sid: string;
  sub?: string;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    throw new Error('JWT_SECRET is required and must not be empty')
  }

  if (secret.length < 32 || secret === 'your_jwt_secret_key_change_in_production') {
    throw new Error('JWT_SECRET must be at least 32 characters and not use default placeholder value')
  }

  return secret
}

const getJwtIssuer = () => process.env.JWT_ISSUER || 'faculty-tracking-api'
const getJwtAudience = () => process.env.JWT_AUDIENCE || 'faculty-tracking-client'

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {} as Record<string, string>

  return cookieHeader.split(';').reduce<Record<string, string>>((accumulator, part) => {
    const index = part.indexOf('=')
    if (index === -1) return accumulator

    const key = part.slice(0, index).trim()
    const value = decodeURIComponent(part.slice(index + 1).trim())
    accumulator[key] = value
    return accumulator
  }, {})
}

export const extractToken = (req: Request) => {
  const authorizationHeader = req.headers['authorization']
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.slice(7)
  }

  const cookies = parseCookies(req.headers.cookie)
  return cookies[AUTH_COOKIE_NAME] || null
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);

  if (!token) {
    logger.debug('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    logger.debug('Invalid token received')
    return res.status(403).json({ error: 'Invalid or expired token' })
  }

  if (!sessionService.isSessionActive(decoded.sid, decoded.id)) {
    logger.debug(`Inactive session rejected for user ${decoded.email}`)
    return res.status(401).json({ error: 'Session expired or revoked' })
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    name: decoded.name,
    roleId: decoded.roleId,
    roleName: decoded.roleName,
    roles: decoded.roles,
    facultyId: decoded.facultyId,
  }

  next()
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      logger.warn(`User ${req.user.email} lacks required role. Required: ${roles.join(', ')}, Has: ${req.user.roles.join(', ')}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const generateToken = (payload: Omit<JWTPayload, 'sid'>, sessionId: string): string => {
  const secret: Secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRY || '24h';
  const options: SignOptions = {
    algorithm: 'HS256',
    issuer: getJwtIssuer(),
    audience: getJwtAudience(),
    subject: String(payload.id),
    expiresIn: expiresIn as any,
  };

  return jwt.sign({ ...payload, sid: sessionId }, secret, options);
};

const normalizeRoute = (route: string) => {
  if (!route || route === '/') return '/';
  return route.replace(/\/+$/, '');
}

const routePatternToRegex = (pattern: string) => {
  const escaped = normalizeRoute(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\.\.\.([^\]]+)\\\]/g, '.+')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+')

  return new RegExp(`^${escaped}$`)
}

const hasRouteAccess = (pathname: string, allowedRoutes: string[]) => {
  const normalizedPath = normalizeRoute(pathname)

  if (normalizedPath.endsWith('/submit')) {
    const parentPath = normalizedPath.replace(/\/submit$/, '') || '/'
    if (allowedRoutes.some((route) => normalizeRoute(route) === parentPath)) {
      return true
    }
  }

  if (normalizedPath.endsWith('/create')) {
    const parentPath = normalizedPath.replace(/\/create$/, '') || '/'
    if (allowedRoutes.some((route) => normalizeRoute(route) === parentPath)) {
      return true
    }
  }

  return allowedRoutes.some((route) => {
    const normalizedRoute = normalizeRoute(route)
    if (normalizedRoute === normalizedPath) return true
    if (!normalizedRoute.includes('[')) return false
    return routePatternToRegex(normalizedRoute).test(normalizedPath)
  })
}

export const requireResource = (resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    try {
      const access = await rolesService.getRoleAccessByRoleId(req.user.roleId)
      if (!hasRouteAccess(resource, access.routePaths)) {
        logger.warn(`User ${req.user.email} lacks resource permission for ${resource}. Allowed routes: ${access.routePaths.join(', ')}`)
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      next()
    } catch (error) {
      logger.error('Resource permission check failed:', error)
      return res.status(500).json({ error: 'Permission verification failed' })
    }
  }
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: getJwtIssuer(),
      audience: getJwtAudience(),
    }) as JWTPayload

    if (!decoded.sid) {
      return null
    }

    return decoded
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};
