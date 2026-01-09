import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';
import { message } from 'antd';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  avatar_urls?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  validateToken: async () => false,
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = Cookies.get('twc_jwt_token');
        const savedUser = Cookies.get('twc_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Validate token
          try {
            await authAPI.validateToken();
          } catch (error) {
            // Token invalid, clear auth
            logout();
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);

      // Get JWT token
      const tokenResponse = await authAPI.login(username, password);
      const jwtToken = tokenResponse.token;

      // Save token to cookie (7 days)
      Cookies.set('twc_jwt_token', jwtToken, { expires: 7 });
      setToken(jwtToken);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      const userData: User = {
        id: userResponse.id,
        username: userResponse.username || userResponse.slug,
        name: userResponse.name,
        email: userResponse.email,
        roles: userResponse.roles || [],
        capabilities: userResponse.capabilities || {},
        avatar_urls: userResponse.avatar_urls,
      };

      // Save user to cookie
      Cookies.set('twc_user', JSON.stringify(userData), { expires: 7 });
      setUser(userData);

      message.success(`Welcome back, ${userData.name}!`);
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear cookies
    Cookies.remove('twc_jwt_token');
    Cookies.remove('twc_refresh_token');
    Cookies.remove('twc_user');

    // Clear state
    setToken(null);
    setUser(null);

    message.info('You have been logged out');
  }, []);

  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      await authAPI.validateToken();
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userResponse = await authAPI.getCurrentUser();
      const userData: User = {
        id: userResponse.id,
        username: userResponse.username || userResponse.slug,
        name: userResponse.name,
        email: userResponse.email,
        roles: userResponse.roles || [],
        capabilities: userResponse.capabilities || {},
        avatar_urls: userResponse.avatar_urls,
      };

      Cookies.set('twc_user', JSON.stringify(userData), { expires: 7 });
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    validateToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
