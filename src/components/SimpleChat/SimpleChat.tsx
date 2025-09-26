'use client';

import React, { useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconMicrophone, IconSend, IconUser, IconMenu, IconApps } from '@douyinfe/semi-icons';
import ChatBubble from '../ChatBubble/ChatBubble';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
import ChatRoom from '../ChatRoom/ChatRoom';
import AppMarket from '../AppMarket/AppMarket';
import AgentChatRoom from '../AgentChatRoom/AgentChatRoom';
import { useSessionManager } from '../../hooks/useSessionManager';
import { useInputManager } from '../../hooks/useInputManager';
import { useChatManager } from '../../hooks/useChatManager';
import { useUIManager } from '../../hooks/useUIManager';

const SimpleChat: React.FC = () => {
  // 使用自定义Hooks管理不同的逻辑
  const sessionManager = useSessionManager();
  const inputManager = useInputManager();
  const chatManager = useChatManager();
  const uiManager = useUIManager();

  // 获取问候语的函数
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 处理发送消息
  const handleSend = async () => {
    console.log('🚀 handleSend 开始执行');
    console.log('📝 当前输入内容:', inputManager.inputValue);
    console.log('🔍 当前状态:', {
      showChatRoom: sessionManager.showChatRoom,
      currentSessionId: sessionManager.currentSessionId
    });
    
    if (inputManager.inputValue.trim()) {
      console.log('✅ 输入内容有效，开始创建新会话');
      
      // 创建新会话并切换到ChatRoom
      const sessionId = await inputManager.createNewSession(inputManager.inputValue.trim());
      console.log('🆔 创建的会话ID:', sessionId);
      
      if (sessionId) {
        console.log('✅ 会话创建成功，开始设置会话状态');
        
        await sessionManager.setSessionIdWithValidation(sessionId, {
          setShowChatRoom: true,
          setInitialMessage: inputManager.inputValue.trim(),
          updateUrl: true
        });
        
        console.log('🔍 设置后的状态:', {
          showChatRoom: sessionManager.showChatRoom,
          currentSessionId: sessionManager.currentSessionId
        });
      } else {
        console.error('❌ 会话创建失败');
      }
      
      inputManager.clearInput();
      console.log('🧹 输入框已清空');
    } else {
      console.log('⚠️ 输入内容为空，跳过发送');
    }
  };

  // 处理登录相关操作
  const handleLoginClick = () => {
    uiManager.handleLoginClick();
  };

  // 处理选择历史会话（增强版，包含输入框清空）
  const handleSelectSession = async (sessionId: string) => {
    console.log('🔍 handleSelectSession 函数被调用，参数:', sessionId);
    console.log('🔍 切换前 inputValue:', inputManager.inputValue);
    
    // 如果当前在AppMarket模式，先回退到主页面
    if (uiManager.showAppMarket) {
      console.log('🔙 从 AppMarket 回退到主页面（历史记录）');
      uiManager.handleAppMarketBackToMain();
    }
    
    // 清空输入框内容
    inputManager.clearInput();
    
    // 调用会话管理器的方法
    await sessionManager.handleSelectSession(sessionId);
    
    console.log('🔍 切换后 inputValue:', inputManager.inputValue);
  };

  // 处理新对话 - 重置所有状态
  const handleNewChat = () => {
    console.log('🆕 开始新对话 - 重置所有状态');
    
    // 如果当前在AppMarket模式，先回退到主页面
    if (uiManager.showAppMarket) {
      console.log('🔙 从 AppMarket 回退到主页面（新对话）');
      uiManager.handleAppMarketBackToMain();
    }
    
    // 如果当前在AgentChatRoom模式，先关闭AgentChatRoom
    if (uiManager.showAgentChatRoom) {
      console.log('🔙 从 AgentChatRoom 回退到主页面（新对话）');
      uiManager.handleAgentChatRoomClose();
    }
    
    // 重置 sessionManager 状态
    sessionManager.handleNewChat();
    // 重置 chatManager 状态
    chatManager.setIsChatMode(false);
    chatManager.setMessages([]);
    // 清空输入框
    inputManager.clearInput();
  };

  // 处理角色选择
  const handleCharacterSelect = async (character: any) => {
    console.log('🎭 选择角色:', character);
    
    // 直接调用 uiManager 的 handleAgentChatRoomOpen 方法
    uiManager.handleAgentChatRoomOpen(character);
  };

  // AppMarket 相关处理函数 - 使用新的统一hook
  const handleAppMarketToggle = () => {
    uiManager.handleAppMarketToggle();
  };

  const handleAppMarketClose = () => {
    uiManager.handleAppMarketClose();
  };

  // 保持兼容性的函数
  const handleAppMarketOpen = () => {
    uiManager.handleAppMarketOpen();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans transition-all duration-700 ease-in-out">
      {/* 左上角侧边栏展开按钮 - 始终显示（除非侧边栏已展开） */}
      {!uiManager.sidebarVisible && (
        <div className="fixed top-5 left-5 z-[60]">
          <Button
            theme="borderless"
            icon={<IconMenu />}
            onClick={uiManager.toggleSidebar}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 transition-all duration-200 flex items-center justify-center"
          />
        </div>
      )}

      {/* 右上角用户按钮 - 始终显示 */}
      <Button
        theme="borderless"
        icon={<IconUser />}
        onClick={handleLoginClick}
        title={uiManager.user ? `${uiManager.user.username} - 点击退出登录` : '点击登录'}
        className={`fixed top-5 right-5 z-[60] w-12 h-12 rounded-full shadow-lg hover:shadow-xl border transition-all duration-200 flex items-center justify-center ${
          uiManager.user 
            ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600' 
            : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500'
        }`}
      />

      {/* 主内容区域 - 根据状态显示不同内容 */}
      {uiManager.showAgentChatRoom && uiManager.selectedAgent ? (
        // AgentChatRoom 模式
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <AgentChatRoom
              agent={uiManager.selectedAgent}
              onBack={uiManager.handleAgentChatRoomBackToAppMarket}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      ) : uiManager.showAppMarket ? (
        // 应用市场模式
        <AppMarket 
          visible={uiManager.showAppMarket}
          onClose={handleAppMarketClose}
          onSelectCharacter={handleCharacterSelect}
        />
      ) : sessionManager.showChatRoom && sessionManager.currentSessionId ? (
        // ChatRoom 模式
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <ChatRoom
              sessionId={sessionManager.currentSessionId}
              initialMessage={sessionManager.initialMessage}
              onBack={sessionManager.handleBackToMain}
              onNewChat={handleNewChat}
              historyMessages={sessionManager.currentMessages}
            />
          </div>
        </div>
      ) : chatManager.isChatMode ? (
        // ChatBubble 模式
        <div className="w-full max-w-4xl mx-auto">
          <ChatBubble
            messages={chatManager.messages}
            onMessageSend={chatManager.handleChatMessageSend}
            onChatsChange={chatManager.handleChatsChange}
            mode="bubble"
            align="leftRight"
            showAvatar={true}
            showTimestamp={true}
            allowAttachments={true}
            placeholder="输入消息..."
          />
        </div>
      ) : (
        // 主页面模式
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
          <div className="w-full flex flex-col items-center gap-5 transition-all duration-700 ease-in-out">
            <div className="w-full flex flex-col items-center gap-4">
              {/* 输入框容器 */}
              <div className="w-full relative bg-white border-2 border-gray-200 rounded-3xl shadow-sm hover:border-gray-300 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-200">
                <textarea
                  ref={inputManager.textareaRef}
                  value={inputManager.inputValue}
                  onChange={inputManager.handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="输入你的消息..."
                  className="w-full resize-none border-none outline-none bg-transparent text-lg px-6 py-4 pr-14 min-h-[60px] max-h-40 overflow-y-auto"
                  rows={1}
                />
                <Button
                  theme="borderless"
                  icon={<IconSend />}
                  onClick={handleSend}
                  disabled={!inputManager.inputValue.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:bg-blue-50 rounded-full p-2 disabled:text-gray-300"
                />
              </div>

              {/* 麦克风按钮 */}
              <div className="flex justify-center">
                <Button
                  theme={inputManager.isListening ? 'solid' : 'borderless'}
                  type={inputManager.isListening ? 'primary' : 'tertiary'}
                  icon={<IconMicrophone />}
                  onClick={inputManager.handleMicrophoneClick}
                  className={`rounded-full px-6 py-3 text-sm font-medium border-2 transition-all duration-700 ease-in-out active:scale-95 active:shadow-inner ${
                       inputManager.isListening 
                         ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-500 text-white animate-pulse shadow-lg transform scale-105' 
                         : 'text-gray-600 bg-white border-gray-200 hover:border-blue-400 hover:text-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:shadow-md hover:transform hover:scale-102'
                     }`}
                  size="large"
                >
                  {inputManager.isListening ? '停止录音' : '语音输入'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 登录模态框 */}
      <LoginModal
        visible={uiManager.showLoginModal}
        onCancel={uiManager.handleLoginCancel}
        onSwitchToRegister={uiManager.handleSwitchToRegister}
      />

      {/* 注册模态框 */}
      <RegisterModal
        visible={uiManager.showRegisterModal}
        onCancel={uiManager.handleRegisterCancel}
        onSwitchToLogin={uiManager.handleSwitchToLogin}
      />

      {/* AI助手侧边栏 */}
      <AiChatSidebar
        visible={uiManager.sidebarVisible}
        onCancel={uiManager.closeSidebar}
        currentSessionId={sessionManager.currentSessionId}
        currentMessages={sessionManager.currentMessages}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onOpenAppMarket={handleAppMarketOpen}
      />
    </div>
  );
};

export default SimpleChat;