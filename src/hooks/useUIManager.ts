import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AppMarketManagerOptions {
  updateUrl?: boolean;
  setInitialCharacter?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  avatar: string;
  description: string;
  prompt?: string;
  sessionId?: string; // 添加会话 ID 字段
}

export const useUIManager = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // AppMarket 相关状态
  const [showAppMarket, setShowAppMarket] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  
  // AgentChatRoom 相关状态
  const [showAgentChatRoom, setShowAgentChatRoom] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  
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

  // ==================== AgentChatRoom 相关方法 ====================

  // 打开 AgentChatRoom
  const handleAgentChatRoomOpen = useCallback(async (agent: AgentInfo) => {
    console.log('🚀 打开 AgentChatRoom:', agent);
    console.log('🔍 Agent详细信息:', {
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      description: agent.description,
      prompt: agent.prompt
    });
    
    try {
      // 导入会话服务
      const { agentSessionService } = await import('../services/agentSessionService');
      
      // 创建新的 Agent 会话
      const sessionResponse = await agentSessionService.createSession({
        agentId: agent.id,
        agentName: agent.name,
        agentPrompt: agent.prompt
      });
      
      console.log('✅ Agent 会话创建成功:', sessionResponse);
      
      // 更新 URL 显示 sessionId
      const url = new URL(window.location.href);
      url.searchParams.set('agentSession', sessionResponse.sessionId);
      window.history.pushState({}, '', url.toString());
      
      // 设置选中的 Agent 和会话信息
      const agentWithSession = {
        ...agent,
        sessionId: sessionResponse.sessionId
      };
      
      // 先设置 AgentChatRoom 状态
      setSelectedAgent(agentWithSession);
      setShowAgentChatRoom(true);
      
      // 然后关闭 AppMarket（如果需要）
      if (showAppMarket) {
        setAppMarketState(false, { updateUrl: false });
      }
      
    } catch (error) {
      console.error('❌ 创建 Agent 会话失败:', error);
      // 即使会话创建失败，也允许进入聊天室（使用临时会话）
      const tempSessionId = `temp_${Date.now()}`;
      const agentWithSession = {
        ...agent,
        sessionId: tempSessionId
      };
      
      // 先设置 AgentChatRoom 状态
      setSelectedAgent(agentWithSession);
      setShowAgentChatRoom(true);
      
      // 然后关闭 AppMarket（如果需要）
      if (showAppMarket) {
        setAppMarketState(false, { updateUrl: false });
      }
    }
  }, [setAppMarketState, showAppMarket]);

  // 关闭 AgentChatRoom
  const handleAgentChatRoomClose = useCallback(() => {
    
    // 清除 URL 中的 sessionId
    const url = new URL(window.location.href);
    url.searchParams.delete('agentSession');
    window.history.pushState({}, '', url.toString());
    
    setShowAgentChatRoom(false);
    setSelectedAgent(null);
  }, []);

  // 从 AgentChatRoom 返回到 AppMarket
  const handleAgentChatRoomBackToAppMarket = useCallback(() => {
    // 保留 URL 中的 sessionId，但返回到 AppMarket
    setShowAgentChatRoom(false);
    setSelectedAgent(null);
    setAppMarketState(true, { updateUrl: false }); // 重新打开 AppMarket
  }, [setAppMarketState])

  // 重置 AgentChatRoom 状态
  const resetAgentChatRoomState = useCallback(() => {
    console.log('🔄 重置 AgentChatRoom 所有状态');
    setShowAgentChatRoom(false);
    setSelectedAgent(null);
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
    // 重置AgentChatRoom状态
    setShowAgentChatRoom(false);
    setSelectedAgent(null);
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
    
    // ==================== AgentChatRoom 状态和方法 ====================
    showAgentChatRoom,
    selectedAgent,
    handleAgentChatRoomOpen,
    handleAgentChatRoomClose,
    handleAgentChatRoomBackToAppMarket,
    resetAgentChatRoomState,
    
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