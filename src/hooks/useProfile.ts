import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

interface UserProfile {
  id: number;
  name: string;
  url?: string;
  description?: string;
  link?: string;
  slug?: string;
  avatar_urls?: {
    24?: string;
    48?: string;
    96?: string;
  };
  meta?: Record<string, any>;
  is_super_admin?: boolean;
  woocommerce_meta?: Record<string, any>;
  _links?: Record<string, any>;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

/**
 * Hook to fetch and manage user profile data
 * Fetches current user profile from WordPress REST API
 * @returns {UseProfileReturn} Profile data, loading state, error, and helper functions
 */
export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in
      const token = Cookies.get('twc_jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch current user with context=edit to get full profile
      const response = await authAPI.getCurrentUser();
      setProfile(response);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load profile data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile data
  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!profile) {
        message.error('No profile loaded');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call update API (you'll need to implement this in api.ts)
        // const updated = await userAPI.update(profile.id, data);
        // setProfile(updated);
        // message.success('Profile updated successfully');

        // For now, just update local state
        setProfile({ ...profile, ...data });
        message.success('Profile updated successfully');
      } catch (err: any) {
        console.error('Failed to update profile:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to update profile';
        setError(errorMessage);
        message.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [profile]
  );

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};
