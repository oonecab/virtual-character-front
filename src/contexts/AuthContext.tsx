'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenManager } from '@/utils/request';
import { UserManagementService, UserInfo } from '@/services/userManagement';

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
      const savedUserInfo = TokenManager.getUserInfo();
      
      if (token && savedUserInfo) {
        // 如果有保存的用户信息，直接使用
        setUser({
          id: parseInt(savedUserInfo.id),
          username: savedUserInfo.username,
          realName: savedUserInfo.realName || '',
          mail: savedUserInfo.mail || '',
          phone: savedUserInfo.phone || '',
          isAdmin: false, // 根据实际需要调整
        });
        setLoading(false);
      } else if (token) {
        try {
          // 如果只有token没有用户信息，调用接口获取
          const userResponse = await UserManagementService.getCurrentUser();
          if (userResponse && userResponse.data) {
            const userInfo = {
              id: userResponse.data.id,
              username: userResponse.data.username,
              realName: userResponse.data.realName,
              mail: userResponse.data.mail,
              phone: userResponse.data.phone,
              isAdmin: false, // 根据实际需要调整
            };
            setUser(userInfo);
            // 保存用户信息到本地存储
            TokenManager.setUserInfo({
              id: userResponse.data.id.toString(),
              username: userResponse.data.username,
              realName: userResponse.data.realName,
              mail: userResponse.data.mail,
              phone: userResponse.data.phone,
            });
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          TokenManager.removeToken();
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, userInfo: User) => {
    TokenManager.setToken(token);
    // 保存用户信息到本地存储
    TokenManager.setUserInfo({
      id: userInfo.id ? userInfo.id.toString() : '',
      username: userInfo.username || '',
      realName: userInfo.realName || '',
      mail: userInfo.mail || '',
      phone: userInfo.phone || '',
    });
    setUser(userInfo);
  };

  const logout = async () => {
    try {
      // 调用后端退出登录接口
      await UserManagementService.logout();
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      // 无论接口调用成功与否，都清除本地状态
      TokenManager.removeToken();
      setUser(null);
      // 跳转到登录页
      window.location.href = '/login';
    }
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