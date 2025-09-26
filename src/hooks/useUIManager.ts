import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AppMarketManagerOptions {
  updateUrl?: boolean;
  setInitialCharacter?: string;
}

export const useUIManager = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // AppMarket 相关状态
  const [showAppMarket, setShowAppMarket] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Modal 相关状态
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // ==================== AppMarket 相关方法 ====================
  
  // 统一的AppMarket状态管理方法
  const setAppMarketState = useCallback((
    show: boolean,
    options: AppMarketManagerOptions = {}
  ) => {
    const {
      updateUrl = true,
      setInitialCharacter = null
    } = options;

    console.log('🔧 setAppMarketState 被调用', {
      show,
      options,
      currentState: showAppMarket
    });

    // 避免重复设置相同的状态
    if (showAppMarket === show) {
      console.log('⚠️ AppMarket状态相同，跳过设置:', show);
      return;
    }

    console.log('📝 设置 AppMarket 状态变化:', {
      from: showAppMarket,
      to: show,
      timestamp: new Date().toISOString()
    });

    // 设置状态
    setShowAppMarket(show);
    
    if (setInitialCharacter) {
      setSelectedCharacter(setInitialCharacter);
    }

    // 如果关闭AppMarket，清空搜索和选中状态
    if (!show) {
      setSearchValue('');
      setSelectedCharacter(null);
    }

    // 更新URL
    if (updateUrl) {
      if (show) {
        router.push('/ai-characters?view=appmarket');
      } else {
        router.push('/ai-characters');
      }
    }
  }, [showAppMarket, router]);

  // 打开AppMarket
  const handleAppMarketOpen = useCallback(() => {
    console.log('🎭 打开 AppMarket');
    setAppMarketState(true);
  }, [setAppMarketState]);

  // 关闭AppMarket
  const handleAppMarketClose = useCallback(() => {
    console.log('❌ 关闭 AppMarket');
    setAppMarketState(false);
  }, [setAppMarketState]);

  // 从AppMarket回退到主页面（用于新对话和历史记录按钮）
  const handleAppMarketBackToMain = useCallback(() => {
    console.log('🔙 从 AppMarket 回退到主页面');
    setAppMarketState(false, { updateUrl: true });
  }, [setAppMarketState]);

  // 切换AppMarket状态
  const handleAppMarketToggle = useCallback(() => {
    console.log('🔄 切换 AppMarket 状态，当前:', showAppMarket);
    setAppMarketState(!showAppMarket);
  }, [showAppMarket, setAppMarketState]);

  // 选择角色
  const handleCharacterSelect = useCallback((character: any) => {
    console.log('🎭 选择角色:', character);
    setSelectedCharacter(character.name);
    
    // 选择角色后关闭AppMarket
    setAppMarketState(false, { updateUrl: false });
    
    return character;
  }, [setAppMarketState]);

  // 搜索处理
  const handleSearchChange = useCallback((value: string) => {
    console.log('🔍 搜索内容变化:', value);
    setSearchValue(value);
  }, []);

  // 清空搜索
  const handleSearchClear = useCallback(() => {
    console.log('🧹 清空搜索');
    setSearchValue('');
  }, []);

  // 重置AppMarket状态
  const resetAppMarketState = useCallback(() => {
    console.log('🔄 重置 AppMarket 所有状态');
    setShowAppMarket(false);
    setSelectedCharacter(null);
    setSearchValue('');
  }, []);

  // ==================== Modal 相关方法 ====================

  // 处理登录按钮点击
  const handleLoginClick = useCallback(() => {
    if (user) {
      // 如果已登录，显示退出登录确认
      if (window.confirm('确定要退出登录吗？')) {
        logout();
      }
    } else {
      // 如果未登录，显示登录模态框
      setShowLoginModal(true);
    }
  }, [user, logout]);

  // 处理登录模态框取消
  const handleLoginCancel = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  // 切换到注册模态框
  const handleSwitchToRegister = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  }, []);

  // 处理注册模态框取消
  const handleRegisterCancel = useCallback(() => {
    setShowRegisterModal(false);
  }, []);

  // 切换到登录模态框
  const handleSwitchToLogin = useCallback(() => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  }, []);

  // 切换侧边栏显示状态
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  // 关闭侧边栏
  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  // ==================== 统一的状态重置方法 ====================
  
  // 重置所有UI状态
  const resetAllUIState = useCallback(() => {
    console.log('🔄 重置所有UI状态');
    // 重置AppMarket状态
    setShowAppMarket(false);
    setSelectedCharacter(null);
    setSearchValue('');
    // 重置Modal状态
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setSidebarVisible(false);
  }, []);

  return {
    // ==================== AppMarket 状态和方法 ====================
    showAppMarket,
    selectedCharacter,
    searchValue,
    handleAppMarketOpen,
    handleAppMarketClose,
    handleAppMarketToggle,
    handleAppMarketBackToMain,
    handleCharacterSelect,
    handleSearchChange,
    handleSearchClear,
    resetAppMarketState,
    setAppMarketState,
    
    // ==================== Modal 状态和方法 ====================
    user,
    showLoginModal,
    showRegisterModal,
    sidebarVisible,
    handleLoginClick,
    handleLoginCancel,
    handleSwitchToRegister,
    handleRegisterCancel,
    handleSwitchToLogin,
    toggleSidebar,
    closeSidebar,
    
    // 状态设置器（保持向后兼容）
    setShowLoginModal,
    setShowRegisterModal,
    setSidebarVisible,
    
    // ==================== 统一方法 ====================
    resetAllUIState
  };
};

export default useUIManager;