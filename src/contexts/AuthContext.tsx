'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenManager } from '../utils/request';

interface User {
  id: number;
  username: string;
  realName: string;
  mail: string;
  phone: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userInfo: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = TokenManager.getToken();
      if (token) {
        try {
          // 这里可以调用获取用户信息的接口
          // 由于当前没有获取用户信息的接口，暂时跳过
          // const userInfo = await request.get('/users/me');
          // setUser(userInfo.data);
        } catch (error) {
          console.error('获取用户信息失败:', error);
          TokenManager.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userInfo: User) => {
    TokenManager.setToken(token);
    setUser(userInfo);
  };

  const logout = () => {
    TokenManager.removeToken();
    setUser(null);
    // 跳转到登录页
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};