'use client';

import React from 'react';
import { useRoles } from '@/hooks/useRoles';

interface RoleGuardProps {
  children: React.ReactNode;
  // Single role
  role?: string;
  // Multiple roles (ANY match required)
  roles?: string[];
  // Check ALL roles match
  allRoles?: string[];
  // Fallback to show when access denied
  fallback?: React.ReactNode;
  // Inverse - hide if has role
  except?: string[];
}

/**
 * RoleGuard Component
 * Conditionally renders children based on user's roles
 *
 * Usage:
 * <RoleGuard role="faculty">Faculty content</RoleGuard>
 * <RoleGuard roles={['hod', 'dean']}>Leadership content</RoleGuard>
 * <RoleGuard allRoles={['faculty', 'verification']}>Must have both</RoleGuard>
 * <RoleGuard except={['maintenance']}>Everything except admin</RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  role,
  roles,
  allRoles,
  except,
  fallback = null,
}) => {
  const roleUtils = useRoles();

  let hasAccess = true;

  if (role) {
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

  if (config.role) {
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
