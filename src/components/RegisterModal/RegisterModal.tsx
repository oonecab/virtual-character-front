'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Notification } from '@douyinfe/semi-ui';
import { UserManagementService } from '../../services/userManagement';
import { UserRegisterReqDTO } from '../../services/userManagement';

interface RegisterModalProps {
  visible: boolean;
  onCancel: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onCancel,
  onSwitchToLogin,
}) => {
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    mail: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegisterFormChange = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!registerForm.username) {
      Notification.error({ 
        title: '验证失败', 
        content: '请输入用户名',
        position: 'top'
      });
      return false;
    }
    if (registerForm.username.length < 3) {
      Notification.error({ 
        title: '验证失败', 
        content: '用户名至少需要3个字符',
        position: 'top'
      });
      return false;
    }
    if (!registerForm.mail) {
      Notification.error({ 
        title: '验证失败', 
        content: '请输入邮箱',
        position: 'top'
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.mail)) {
      Notification.error({ 
        title: '验证失败', 
        content: '请输入有效的邮箱地址',
        position: 'top'
      });
      return false;
    }
    if (!registerForm.password) {
      Notification.error({ 
        title: '验证失败', 
        content: '请输入密码',
        position: 'top'
      });
      return false;
    }
    if (registerForm.password.length < 6) {
      Notification.error({ 
        title: '验证失败', 
        content: '密码至少需要6个字符',
        position: 'top'
      });
      return false;
    }
    if (!registerForm.confirmPassword) {
      Notification.error({ 
        title: '验证失败', 
        content: '请确认密码',
        position: 'top'
      });
      return false;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      Notification.error({ 
        title: '验证失败', 
        content: '两次输入的密码不一致',
        position: 'top'
      });
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registerData: UserRegisterReqDTO = {
        username: registerForm.username,
        password: registerForm.password,
        realName: registerForm.realName,
        phone: registerForm.phone,
        mail: registerForm.mail,
      };

      const response = await UserManagementService.register(registerData);
      
      if (response.success) {
        Notification.success({ 
          title: '注册成功', 
          content: response.message || '注册成功！',
          position: 'top'
        });
        onCancel(); // 关闭模态框
        setRegisterForm({
          username: '',
          password: '',
          confirmPassword: '',
          realName: '',
          phone: '',
          mail: '',
        });
      } else {
        Notification.error({ 
          title: '注册失败', 
          content: response.message || '注册失败',
          position: 'top'
        });
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后重试';
      Notification.error({ 
        title: '注册失败', 
        content: errorMessage,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRegisterForm({
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      phone: '',
      mail: '',
    });
    onCancel();
  };

  return (
    <Modal
      title="注册账号"
      visible={visible}
      onOk={handleRegisterSubmit}
      onCancel={handleCancel}
      okText="注册"
      cancelText="取消"
      width={400}
      centered
      bodyStyle={{ padding: '24px' }}
      className="register-modal"
      confirmLoading={loading}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <Input
            placeholder="用户名（3-20个字符）"
            value={registerForm.username}
            onChange={(value) => handleRegisterFormChange('username', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
          <Input
            type="password"
            placeholder="请再次输入密码"
            value={registerForm.confirmPassword}
            onChange={(value) => handleRegisterFormChange('confirmPassword', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <Input
            type="password"
            placeholder="密码（至少6个字符）"
            value={registerForm.password}
            onChange={(value) => handleRegisterFormChange('password', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
          <Input
            placeholder="请输入真实姓名"
            value={registerForm.realName}
            onChange={(value) => handleRegisterFormChange('realName', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
          <Input
            placeholder="请输入手机号"
            value={registerForm.phone}
            onChange={(value) => handleRegisterFormChange('phone', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
          <Input
            placeholder="请输入邮箱地址"
            value={registerForm.mail}
            onChange={(value) => handleRegisterFormChange('mail', value)}
            size="large"
            className="rounded-lg"
            disabled={loading}
          />
        </div>
      </div>
      <div className="text-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-gray-600 text-sm">已有账号？</span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:text-blue-600 text-sm ml-1 underline transition-colors duration-200"
          disabled={loading}
        >
          立即登录
        </button>
      </div>
    </Modal>
  );
};

export default RegisterModal;