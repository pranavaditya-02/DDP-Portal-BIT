'use client';

import React from 'react';
import { useRoles } from '@/hooks/useRoles';

interface RoleGuardProps {
  children: React.ReactNode;
  // Single role (legacy)
  role?: string;
  // Multiple roles (ANY match required, legacy)
  roles?: string[];
  // Check ALL roles match (legacy)
  allRoles?: string[];
  // Resource path to check against assigned role permissions
  resource?: string;
  // Multiple resources token OR|AND matching
  resources?: string[];
  // Fallback to show when access denied
  fallback?: React.ReactNode;
  // Inverse - hide if has role
  except?: string[];
}

/**
 * RoleGuard Component
 * Conditionally renders children based on user permissions.
 * Prefer resource-based checks for RBAC.
 *
 * Usage:
 * <RoleGuard resource="/student/activity/verification-panel">Verifier content</RoleGuard>
 * <RoleGuard resources={['/activities/admin', '/verification']} fallback={<NotAllowed />}>Admin content</RoleGuard>
 * <RoleGuard role="faculty">Faculty content</RoleGuard> // legacy
 * <RoleGuard roles={['hod', 'dean']}>Leadership content</RoleGuard> // legacy
 * <RoleGuard allRoles={['faculty', 'verification']}>Must have both</RoleGuard> // legacy
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  role,
  roles,
  allRoles,
  resource,
  resources,
  except,
  fallback = null,
}) => {
  const roleUtils = useRoles();

  let hasAccess = true;

  if (resource) {
    hasAccess = roleUtils.canAccessResource(resource);
  } else if (resources && resources.length > 0) {
    hasAccess = roleUtils.canAccessAnyResource(resources);
  } else if (role) {
    hasAccess = roleUtils.hasRole(role);
  } else if (roles && roles.length > 0) {
    hasAccess = roleUtils.hasAnyRole(roles);
  } else if (allRoles && allRoles.length > 0) {
    hasAccess = roleUtils.hasAllRoles(allRoles);
  }

  // Invert check for 'except'
  if (except && except.length > 0) {
    const hasExceptRole = roleUtils.hasAnyRole(except);
    hasAccess = !hasExceptRole;
  }

  return <>{hasAccess ? children : fallback}</>;
};

/**
 * Hook version for more control
 * Useful in components that need conditional logic beyond rendering
 */
export const useRoleGuard = (config: Omit<RoleGuardProps, 'children' | 'fallback'>): boolean => {
  const roleUtils = useRoles();

  let hasAccess = true;

  if (config.resource) {
    hasAccess = roleUtils.canAccessResource(config.resource);
  } else if (config.resources && config.resources.length > 0) {
    hasAccess = roleUtils.canAccessAnyResource(config.resources);
  } else if (config.role) {
    hasAccess = roleUtils.hasRole(config.role);
  } else if (config.roles && config.roles.length > 0) {
    hasAccess = roleUtils.hasAnyRole(config.roles);
  } else if (config.allRoles && config.allRoles.length > 0) {
    hasAccess = roleUtils.hasAllRoles(config.allRoles);
  }

  if (config.except && config.except.length > 0) {
    const hasExceptRole = roleUtils.hasAnyRole(config.except);
    hasAccess = !hasExceptRole;
  }

  return hasAccess;
};
