import { useState } from 'react';
import { message } from 'antd';
import { userAPI } from '../services/api';

type CreateUserData = {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  roles?: string[];
};

const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createUser = async (data: CreateUserData) => {
    setLoading(true);
    setError(null);

    try {
      const username = (data.email || '').replace(/@.*$/, '');

      const payload = {
        username,
        email: data.email,
        password: data.password,
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        roles: data.roles || ['subscriber'],
      } as any;

      const res = await userAPI.create(payload);

      message.success('Account created successfully');

      return res;
    } catch (err: any) {
      setError(err);

      const errMsg =
        err?.response?.data?.message || err?.message || 'Failed to create user';
      message.error(errMsg);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
};

export default useCreateUser;
