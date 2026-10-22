import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken } from '@/lib/api';
import type { CMSUser } from '@/lib/types';

interface LoginPayload {
  username_or_email: string;
  password: string;
  remember_me?: boolean;
}

interface LoginResponse {
  user: CMSUser;
  access_token?: string;
  message?: string;
}

interface MeResponse {
  user: CMSUser;
  csrf_token?: string;
}

interface AuthContextType {
  user: CMSUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<CMSUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CMSUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CMSUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<CMSUser | null> => {
    try {
      const res = await api.get<MeResponse>('/auth/me/');
      if (res && res.user) {
        setUser(res.user);
        return res.user;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginPayload): Promise<CMSUser> => {
    const res = await api.post<LoginResponse>('/auth/login/', {
      username: credentials.username_or_email,
      username_or_email: credentials.username_or_email,
      password: credentials.password,
      remember_me: credentials.remember_me || false,
    });

    if (res.access_token) {
      setAccessToken(res.access_token);
    }
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
