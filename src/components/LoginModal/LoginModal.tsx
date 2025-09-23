'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Notification } from '@douyinfe/semi-ui';
import { UserManagementService } from '../../services/userManagement';
import { UserLoginReqDTO } from '../../services/userManagement';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  visible: boolean;
  onCancel: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onCancel,
  onSwitchToRegister,
}) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLoginFormChange = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginSubmit = async () => {
    if (!loginForm.username || !loginForm.password) {
      Notification.error({ 
        title: '登录失败', 
        content: '请输入用户名和密码',
        position: 'top'
      });
      return;
    }

    setLoading(true);
    try {
      const loginData: UserLoginReqDTO = {
        username: loginForm.username,
        password: loginForm.password,
      };

      const response = await UserManagementService.login(loginData);
      console.log('登录响应:', response);
      
      if (response && response.data) {
        const userInfo = response.data;
        
        // 使用认证上下文存储用户信息
        const authUserInfo = {
          id: userInfo.id,
          username: userInfo.username,
          realName: userInfo.realName || userInfo.username,
          mail: userInfo.mail || '',
          phone: userInfo.phone || '',
          isAdmin: false,
        };
        
        const token = 'temp_token_' + Date.now();
        login(token, authUserInfo);
        
        Notification.success({ 
          title: '登录成功', 
          content: '欢迎回来！',
          position: 'top'
        });
        
        onCancel();
        setLoginForm({ username: '', password: '' });
      } else {
        Notification.error({ 
          title: '登录失败', 
          content: '用户名或密码错误',
          position: 'top'
        });
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请稍后重试';
      Notification.error({ 
        title: '登录失败', 
        content: errorMessage,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoginForm({ username: '', password: '' });
    onCancel();
  };

  return (
    <Modal
      title="登录"
      visible={visible}
      onOk={handleLoginSubmit}
      onCancel={handleCancel}
      okText="登录"
      cancelText="取消"
      width={400}
      centered
      bodyStyle={{ padding: '24px' }}
      className="login-modal"
      confirmLoading={loading}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">账号</label>
          <Input
            placeholder="请输入账号"
            value={loginForm.username}
            onChange={(value) => handleLoginFormChange('username', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <Input
            type="password"
            placeholder="请输入密码"
            value={loginForm.password}
            onChange={(value) => handleLoginFormChange('password', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
            onEnterPress={handleLoginSubmit}
          />
        </div>
      </div>
      <div className="text-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-gray-600 text-sm">没有账号？</span>
        <button
          onClick={onSwitchToRegister}
          className="text-blue-500 hover:text-blue-600 text-sm ml-1 underline transition-colors duration-200"
          disabled={loading}
        >
          注册一个
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;