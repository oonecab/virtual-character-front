'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Chat, Input, Button, Toast } from '@douyinfe/semi-ui';
import { IconSend, IconMicrophone, IconMenu } from '@douyinfe/semi-icons';
import { useAgentChatRoom } from './hooks';
import { useInputManager } from '../../hooks/useInputManager';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
import VoiceButton from './VoiceButton';
import type { Agent } from './types';
import './AgentChatRoom.css';

/**
 * AgentChatRoom 组件的属性接口
 */
interface AgentChatRoomProps {
  /** Agent 信息 */
  agent: Agent;
  /** 返回按钮点击回调 */
  onBack?: () => void;
  /** 新对话按钮点击回调 */
  onNewChat?: () => void;
}

const commonOuterStyle = {
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'all 0.6s ease-out',
  paddingBottom: '120px', // 为固定输入框留出空间
};

const animatedStyle = {
  ...commonOuterStyle,
  opacity: 1,
  transform: 'translateY(0)',
};

const AgentChatRoom: React.FC<AgentChatRoomProps> = ({ 
  agent, 
  onBack, 
  onToggleSidebar, 
  onNewChat 
}) => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const audioRecorder = useAudioRecorder();
  
  const {
    messages,
    isLoading,
    connectionStatus,
    isAnimated,
    onMessageSend,
    handleRecordingComplete
  } = useAgentChatRoom(agent);

  const inputManager = useInputManager({
    onSendMessage: onMessageSend,
    onRecordingComplete: handleRecordingComplete,
    audioRecorder: audioRecorder,
  });

  // 移除WebSocket相关代码，改用同步音频转文字接口



  // 动态生成roleInfo，使用agent的头像和名称
  const roleInfo = {
    user: {
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
    },
    assistant: {
      name: agent?.name || '智能助手',
      avatar: agent?.avatar || 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
    },
  };



  // 处理输入框发送
  const handleSendMessage = useCallback(() => {
    if (!inputManager.inputValue.trim()) {
      Toast.warning({
        content: '请输入消息内容',
        duration: 1000,
      });
      return;
    }
    
    onMessageSend(inputManager.inputValue.trim());
    inputManager.clearInput();
  }, [inputManager.inputValue, inputManager.clearInput, onMessageSend]);

  // 处理键盘事件
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 处理侧边栏相关回调
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleNewChatFromSidebar = useCallback(() => {
    if (onNewChat) {
      onNewChat();
    }
    setIsSidebarOpen(false);
  }, [onNewChat]);
   return (
    <div className="agent-chat-room">
      {/* 左上角侧边栏展开按钮 - 始终显示（除非侧边栏已展开） */}
      {!isSidebarOpen && (
        <div className="fixed top-5 left-5 z-[60]">
          <Button
            theme="borderless"
            icon={<IconMenu />}
            onClick={handleSidebarToggle}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-500 transition-all duration-200 flex items-center justify-center"
          />
        </div>
      )}

      {/* 聊天内容区域 */}
      <Chat
        chats={messages}
        style={isAnimated ? animatedStyle : commonOuterStyle}
        roleConfig={roleInfo}
        showStopGenerate={false}
        showClearContext={false}
        showInput={false}
        inputAreaProps={{ style: { display: 'none' } }}
        renderChatBoxAction={(message, defaultDom) => {
          return defaultDom;
        }}
        markdownRenderProps={{
          className: 'chat-message-content'
        }}
      />
      
      {/* 固定定位的输入框 */}
      <div className="fixed-input-area">
        {/* 语音播放按钮区域 */}
        {(() => {
          // 获取最后一条AI助手的消息
          const lastAssistantMessage = messages?.slice().reverse().find(msg => msg.role === 'assistant');
          console.log('🔊 [AgentChatRoom] 检查最后一条AI消息:', lastAssistantMessage);
          console.log('🔊 [AgentChatRoom] 消息内容类型:', typeof lastAssistantMessage?.content);
          console.log('🔊 [AgentChatRoom] 消息内容长度:', lastAssistantMessage?.content?.length);
          console.log('🔊 [AgentChatRoom] Agent名称:', agent?.name);
          
          if (lastAssistantMessage && lastAssistantMessage.content && typeof lastAssistantMessage.content === 'string') {
            return (
              <div className="voice-button-area">
                <VoiceButton 
                  text={lastAssistantMessage.content}
                  agentName={agent?.name}
                  size="default"
                  circle={false}
                  style={{
                    marginBottom: '12px'
                  }}
                />
              </div>
            );
          }
          return null;
        })()}
        
        <div className="input-container">
          {/* 麦克风按钮 */}
          <div className="microphone-container">
            <Button
              theme={inputManager.isListening ? "solid" : "borderless"}
              type={inputManager.isListening ? "primary" : "tertiary"}
              icon={<IconMicrophone />}
              onClick={() => {
                console.log('🎤 麦克风按钮被点击');
                console.log('🎤 当前状态:', {
                  isListening: inputManager.isListening,
                  audioRecorder: inputManager.audioRecorder?.state
                });
                inputManager.handleMicrophoneClick();
              }}
              className={`microphone-button ${inputManager.isListening ? 'recording' : ''}`}
              size="large"
            />
          </div>
          
          {/* 输入框和发送按钮 */}
          <div className="input-wrapper">
            {/* 录音状态显示区域 */}
            {inputManager.isListening && (
              <div className="recording-indicator">
                <div className="recording-status">
                  <div className="pulse-dot"></div>
                  <span>录音中...</span>
                </div>
              </div>
            )}
            
            <Input
              value={inputManager.inputValue}
              onChange={inputManager.handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={isLoading ? "AI正在回复中..." : "输入你的消息... (Enter发送，Shift+Enter换行)"}
              size="large"
              className="chat-input"
              disabled={isLoading}
              suffix={
                <Button
                  theme="solid"
                  type="primary"
                  icon={<IconSend />}
                  onClick={handleSendMessage}
                  disabled={!inputManager.inputValue.trim() || isLoading}
                  className="send-button"
                  loading={isLoading}
                />
              }
            />
          </div>
        </div>
      </div>

      {/* AI助手侧边栏 */}
      <AiChatSidebar
        visible={isSidebarOpen}
        onCancel={handleSidebarClose}
        currentSessionId={agent?.sessionId}
        currentMessages={messages?.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date()
        })) || []}
        onNewChat={handleNewChatFromSidebar}
      />
    </div>
  );
};

export default AgentChatRoom;