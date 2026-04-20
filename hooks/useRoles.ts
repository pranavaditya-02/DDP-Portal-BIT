import { useAuthStore } from '@/lib/store';
import { hasRouteAccess, normalizePath } from '@/lib/route-access';

export const useRoles = () => {
  const user = useAuthStore((state) => state.user);
  const allowedResources = useAuthStore((state) => state.allowedResources);
  const allowedRoutes = useAuthStore((state) => state.allowedRoutes);
  const normalizedRoles = (user?.roles ?? []).map((role) => role.toLowerCase());

  const hasResourceAccess = (resourceHref: string) => {
    const normalized = normalizePath(resourceHref);
    if (allowedResources.some((resource) => normalizePath(resource.href) === normalized)) {
      return true;
    }
    return hasRouteAccess(normalized, allowedRoutes);
  };

  return {
    // Resource-based access checks
    canAccessResource: (resourceHref: string): boolean => hasResourceAccess(resourceHref),
    canAccessAnyResource: (resourceHrefs: string[]): boolean =>
      resourceHrefs.some((resource) => hasResourceAccess(resource)),
    canAccessAllResources: (resourceHrefs: string[]): boolean =>
      resourceHrefs.every((resource) => hasResourceAccess(resource)),

    // Legacy role helpers (for compatibility only)
    hasRole: (role: string): boolean => {
      return normalizedRoles.includes(role.toLowerCase());
    },
    hasAnyRole: (roles: string[]): boolean => {
      return roles.map((role) => role.toLowerCase()).some((role) => normalizedRoles.includes(role));
    },
    hasAllRoles: (roles: string[]): boolean => {
      return roles.map((role) => role.toLowerCase()).every((role) => normalizedRoles.includes(role));
    },

    // Role shortcuts (deprecated for access control)
    isFaculty: (): boolean => normalizedRoles.includes('faculty'),
    isHod: (): boolean => normalizedRoles.includes('hod'),
    isDean: (): boolean => normalizedRoles.includes('dean'),
    isStudent: (): boolean => normalizedRoles.includes('student'),
    isVerification: (): boolean => normalizedRoles.includes('verification'),
    isMaintenance: (): boolean => normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin'),

    isAdmin: (): boolean => normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin'),
    isLeadership: (): boolean => {
      return normalizedRoles.some((role) => ['hod', 'dean', 'maintenance', 'admin'].includes(role));
    },
    canApprove: (): boolean => {
      return normalizedRoles.includes('verification');
    },
    canManageUsers: (): boolean => {
      return normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin');
    },

    // Get user roles
    roles: normalizedRoles,
    hasMultipleRoles: (): boolean => normalizedRoles.length > 1,
  };
};
