import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useModalManager = () => {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 处理登录按钮点击
  const handleLoginClick = () => {
    if (user) {
      // 如果已登录，显示退出登录确认
      if (window.confirm('确定要退出登录吗？')) {
        logout();
      }
    } else {
      // 如果未登录，显示登录模态框
      setShowLoginModal(true);
    }
  };

  // 处理登录模态框取消
  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  // 切换到注册模态框
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // 处理注册模态框取消
  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
  };

  // 切换到登录模态框
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // 关闭侧边栏
  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  return {
    // 状态
    user,
    showLoginModal,
    showRegisterModal,
    sidebarVisible,
    
    // 方法
    handleLoginClick,
    handleLoginCancel,
    handleSwitchToRegister,
    handleRegisterCancel,
    handleSwitchToLogin,
    toggleSidebar,
    closeSidebar,
    
    // 状态设置器
    setShowLoginModal,
    setShowRegisterModal,
    setSidebarVisible
  };
};