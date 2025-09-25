import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Toast } from '@douyinfe/semi-ui';
import { IconMenu, IconUser } from '@douyinfe/semi-icons';
import ChatHeader from '../Chat/ChatHeader';
import MessageList from '../Chat/MessageList';
import ChatInput from '../Chat/ChatInput';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useModal, useSidebar, useGreeting } from '../../hooks/useChat';
import { ChatService } from '../../services/chatService';

const SimpleChat: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getGreeting } = useGreeting(user?.username);
  
  // 聊天状态管理
  const { state, sendMessage, createNewSession, selectSession, goToHome, goToChat } = useChat();
  
  const {
    currentSessionId,
    currentMessages,
    isLoading,
  } = state;
  
  // UI状态管理
  const {
    showLoginModal,
    showRegisterModal,
    openLogin,
    openRegister,
    closeAll: closeModals,
    switchToRegister,
    switchToLogin,
  } = useModal();
  
  const {
    visible: sidebarVisible,
    open: openSidebar,
    close: closeSidebar,
  } = useSidebar();

  // 从URL读取sessionId并初始化
  useEffect(() => {
    // 在Next.js中，我们需要使用不同的方式获取URL参数
    // 这里暂时注释掉，因为需要使用useSearchParams
    // const urlParams = new URLSearchParams(location.search);
    // const sessionId = urlParams.get('sessionId');
    
    // if (sessionId && sessionId !== state.currentSessionId) {
    //   selectSession(sessionId);
    // }
  }, [state.currentSessionId, selectSession]);

  // 事件处理方法
  const handleSend = async (message: string) => {
    try {
      if (!state.currentSessionId) {
        // 创建新会话
        await createNewSession(message);
      } else {
        // 发送消息到现有会话
        await sendMessage(message);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      Toast.error('发送消息失败');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await selectSession(sessionId);
      goToChat(sessionId);
    } catch (error) {
      console.error('选择会话失败:', error);
      Toast.error('加载会话失败');
    }
  };

  const handleNewChat = () => {
    goToHome();
  };

  const handleBackToMain = () => {
    goToHome();
  };

  const handleLoginClick = () => {
    if (user) {
      if (window.confirm('确定要退出登录吗？')) {
        logout();
      }
    } else {
      openLogin();
    }
  };

  // 渲染聊天界面
  if (state.currentSessionId) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <ChatHeader
          title={currentSession?.title || "AI 助手"}
          showBackButton={true}
          showMenuButton={true}
          showNewChatButton={true}
          onBack={handleBackToMain}
          onMenuClick={openSidebar}
          onNewChat={handleNewChat}
        />
        
        <MessageList
          messages={currentMessages}
          loading={isLoading}
          className="flex-1"
        />
        
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="输入你的问题..."
        />
        
        <AiChatSidebar
          visible={sidebarVisible}
          onCancel={closeSidebar}
          currentSessionId={state.currentSessionId}
          currentMessages={currentMessages}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />
        
        <LoginModal
          visible={showLoginModal}
          onCancel={closeModals}
          onSwitchToRegister={switchToRegister}
        />
        
        <RegisterModal
          visible={showRegisterModal}
          onCancel={closeModals}
          onSwitchToLogin={switchToLogin}
        />
      </div>
    );
  }

  // 渲染主页面
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans transition-all duration-700 ease-in-out">
      {/* 左上角侧边栏展开按钮 */}
      {!sidebarVisible && (
        <div className="fixed top-5 left-5 z-50">
          <Button
            theme="borderless"
            icon={<IconMenu />}
            onClick={openSidebar}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 transition-all duration-200 flex items-center justify-center"
          />
        </div>
      )}

      {/* 右上角用户按钮 */}
      <div className="fixed top-5 right-5 z-50 flex gap-3">
        <Button
          theme="borderless"
          icon={<IconUser />}
          onClick={handleLoginClick}
          title={user ? `${user.username} - 点击退出登录` : '点击登录'}
          className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl border transition-all duration-200 flex items-center justify-center ${
            user 
              ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500'
          }`}
        />
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        {/* 问候区域 */}
        <div className="text-center mb-5 transition-all duration-700 ease-in-out">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3 leading-tight">
            {getGreeting()}，最近感觉如何？
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            有什么想聊的吗？我随时都在
          </p>
        </div>

        {/* 输入区域 */}
        <div className="w-full">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder="输入你的消息..."
            className="border-2 border-gray-200 rounded-3xl shadow-sm hover:border-gray-300 focus-within:border-blue-500 focus-within:shadow-lg"
          />
        </div>
      </div>

      {/* 侧边栏 */}
      <AiChatSidebar
        visible={sidebarVisible}
        onCancel={closeSidebar}
        currentSessionId={state.currentSessionId}
        currentMessages={currentMessages}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {/* 登录模态框 */}
      <LoginModal
        visible={showLoginModal}
        onCancel={closeModals}
        onSwitchToRegister={switchToRegister}
      />

      {/* 注册模态框 */}
      <RegisterModal
        visible={showRegisterModal}
        onCancel={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default SimpleChat;