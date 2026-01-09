import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Helper hook to check specific capabilities
export const useHasCapability = (capability: string): boolean => {
  const { user } = useAuth();
  return user?.capabilities?.[capability] || false;
};

// Helper hook to check if user has any of the specified roles
export const useHasRole = (roles: string | string[]): boolean => {
  const { user } = useAuth();
  if (!user?.roles) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.some((role) => user.roles.includes(role));
};

// Helper hook to check if user is admin
export const useIsAdmin = (): boolean => {
  const hasAdminRole = useHasRole('administrator');
  const hasManageOptions = useHasCapability('manage_options');
  return hasAdminRole || hasManageOptions;
};
