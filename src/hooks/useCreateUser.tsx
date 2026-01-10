import { useState } from 'react';
import { userAPI } from '../services/api';
import { message } from 'antd';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  description?: string;
  url?: string;
  locale?: string;
}

interface UseCreateUserReturn {
  createUser: (userData: CreateUserData) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useCreateUser = (): UseCreateUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: CreateUserData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.create(userData);
      message.success(`User ${userData.username} created successfully!`);
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create user';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    loading,
    error,
  };
};
