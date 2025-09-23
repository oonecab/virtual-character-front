'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Toast } from '@douyinfe/semi-ui';
import { IconMicrophone, IconSend, IconUser, IconMenu } from '@douyinfe/semi-icons';
import { useRouter } from 'next/navigation';
import ChatBubble from '../ChatBubble/ChatBubble';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';
import { useAuth } from '../../contexts/AuthContext';
import AiChatService from '../../services/aiChatService';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
import ChatRoom from '../ChatRoom/ChatRoom';

const SimpleChat: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false); // 新增：控制ChatRoom显示
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // 新增：当前会话ID
  const [initialMessage, setInitialMessage] = useState<string>(''); // 新增：初始消息
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取动态问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour >= 5 && hour < 12) {
      timeGreeting = '早上好';
    } else if (hour >= 12 && hour < 14) {
      timeGreeting = '中午好';
    } else if (hour >= 14 && hour < 18) {
      timeGreeting = '下午好';
    } else {
      timeGreeting = '晚上好';
    }

    const username = user?.username || '朋友';
    return `${timeGreeting}，${username}`;
  };

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      // 创建新会话并切换到ChatRoom
      const sessionId = await createNewSession(inputValue.trim());
      if (sessionId) {
        setCurrentSessionId(sessionId);
        setInitialMessage(inputValue.trim());
        setShowChatRoom(true);
        // 跳转到带有sessionId的URL
        router.push(`/ai-characters?sessionId=${sessionId}`);
      }
      setInputValue('');
    }
  };

  const handleMicrophoneClick = () => {
    setIsListening(!isListening);
    // 这里可以添加语音识别逻辑
    console.log('麦克风状态:', !isListening ? '开启' : '关闭');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatMessageSend = (content: string, attachment?: any) => {
    const userMessage = {
      role: 'user',
      id: `user-${Date.now()}`,
      createAt: Date.now(),
      content: content,
    };

    // 添加平滑的消息发送动画
    setTimeout(() => {
      setMessages(prev => [...prev, userMessage]);
    }, 50);

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        id: `ai-${Date.now()}`,
        createAt: Date.now(),
        content: '这是AI的回复消息。',
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1200);
  };

  const handleChatsChange = (chats: any[]) => {
    setMessages(chats);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

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

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // 创建新的AI会话
  const createNewSession = async (firstMessage: string): Promise<string | null> => {
    try {
      const session = await AiChatService.createSession(firstMessage);
      return session ? session.sessionId : null;
    } catch (error) {
      console.error('创建会话失败:', error);
      Toast.error('创建会话失败，请重试');
      return null;
    }
  };

  // 处理从AiChatSidebar开始聊天
  const handleStartChat = async (message: string) => {
    try {
      // 创建新会话
      const sessionId = await createNewSession(message);
      if (sessionId) {
        setCurrentSessionId(sessionId);
        setInitialMessage(message);
        setShowChatRoom(true);
        // 跳转到带有sessionId的URL
        router.push(`/ai-characters?sessionId=${sessionId}`);
      }
    } catch (error) {
      console.error('开始聊天失败:', error);
      Toast.error('开始聊天失败，请重试');
    }
  };

  // 返回到主页面
  const handleBackToMain = () => {
    setShowChatRoom(false);
    setCurrentSessionId(null);
    setInitialMessage('');
  };

  // 如果显示ChatRoom，在主页面布局中渲染ChatRoom组件
  if (showChatRoom && currentSessionId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans transition-all duration-700 ease-in-out">
        {/* 左上角侧边栏展开按钮 */}
        {!sidebarVisible && (
          <div className="fixed top-5 left-5 z-50">
            <Button
              theme="borderless"
              icon={<IconMenu />}
              onClick={() => setSidebarVisible(true)}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 transition-all duration-200 flex items-center justify-center"
            />
          </div>
        )}

        {/* 右上角按钮组 */}
        <div className="fixed top-5 right-5 z-50 flex gap-3">
          {/* 用户按钮 */}
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

        {/* ChatRoom组件 - 在主页面布局中显示 */}
        <div className="w-full max-w-4xl mx-auto">
          <ChatRoom
            sessionId={currentSessionId}
            initialMessage={initialMessage}
            onBack={handleBackToMain}
          />
        </div>

        {/* 侧边栏 */}
        <AiChatSidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onStartChat={handleStartChat}
        />

        {/* 登录模态框 */}
        <LoginModal
          visible={showLoginModal}
          onCancel={handleLoginCancel}
          onSwitchToRegister={handleSwitchToRegister}
        />

        {/* 注册模态框 */}
        <RegisterModal
          visible={showRegisterModal}
          onCancel={handleRegisterCancel}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    );
  }

  if (isChatMode) {
    return (
      <div className="min-h-screen bg-white p-5 font-sans transition-all duration-700 ease-in-out">
        {/* 右上角用户按钮 */}
        <div className="fixed top-5 right-5 z-50">
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
        <div className="w-full max-w-4xl mx-auto">
          <ChatBubble
            messages={messages}
            onMessageSend={handleChatMessageSend}
            onChatsChange={handleChatsChange}
            mode="bubble"
            align="leftRight"
            style={{
              height: 'calc(100vh - 40px)',
              margin: '0',
              border: 'none',
              boxShadow: 'none',
              transition: 'all 0.3s ease-in-out',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans transition-all duration-700 ease-in-out">
      {/* 左上角侧边栏展开按钮 */}
      {!sidebarVisible && (
        <div className="fixed top-5 left-5 z-50">
          <Button
            theme="borderless"
            icon={<IconMenu />}
            onClick={() => setSidebarVisible(true)}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 transition-all duration-200 flex items-center justify-center"
          />
        </div>
      )}

      {/* 右上角按钮组 */}
      <div className="fixed top-5 right-5 z-50 flex gap-3">
        {/* 用户按钮 */}
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
        <div className="w-full flex flex-col items-center gap-5 transition-all duration-700 ease-in-out">
          <div className="w-full flex flex-col items-center gap-4">
            {/* 输入框容器 */}
            <div className="w-full relative bg-white border-2 border-gray-200 rounded-3xl shadow-sm hover:border-gray-300 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="输入你的消息..."
                className="w-full resize-none border-none outline-none bg-transparent text-lg px-6 py-4 pr-14 min-h-[60px] max-h-40 overflow-y-auto"
                rows={1}
              />
              <Button
                theme="borderless"
                icon={<IconSend />}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:bg-blue-50 rounded-full p-2 disabled:text-gray-300"
              />
            </div>

            {/* 麦克风按钮 */}
            <div className="flex justify-center">
              <Button
                theme={isListening ? 'solid' : 'borderless'}
                type={isListening ? 'primary' : 'tertiary'}
                icon={<IconMicrophone />}
                onClick={handleMicrophoneClick}
                className={`rounded-full px-6 py-3 text-sm font-medium border-2 transition-all duration-700 ease-in-out active:scale-95 active:shadow-inner ${
                     isListening 
                       ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-500 text-white animate-pulse shadow-lg transform scale-105' 
                       : 'text-gray-600 bg-white border-gray-200 hover:border-blue-400 hover:text-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:shadow-md hover:transform hover:scale-102'
                   }`}
                size="large"
              >
                {isListening ? '停止录音' : '语音输入'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 登录模态框 */}
      <LoginModal
        visible={showLoginModal}
        onCancel={handleLoginCancel}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* 注册模态框 */}
      <RegisterModal
        visible={showRegisterModal}
        onCancel={handleRegisterCancel}
        onSwitchToLogin={handleSwitchToLogin}
      />

      {/* AI助手侧边栏 */}
      <AiChatSidebar
        visible={sidebarVisible}
        onCancel={() => setSidebarVisible(false)}
      />
    </div>
  );
};

export default SimpleChat;