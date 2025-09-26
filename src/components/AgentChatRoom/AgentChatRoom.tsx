'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Chat, Input, Button, Toast } from '@douyinfe/semi-ui';
import { IconSend, IconMicrophone, IconMenu } from '@douyinfe/semi-icons';
import { useAgentChatRoom } from './hooks';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
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

const roleInfo = {
  user: {
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
  },
  assistant: {
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
  },
};

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

const AgentChatRoom: React.FC<AgentChatRoomProps> = ({ agent, onBack, onNewChat }) => {
  const {
    messages,
    isLoading,
    connectionStatus,
    isAnimated,
    onMessageSend,
    handleRecordingComplete
  } = useAgentChatRoom(agent);

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 处理输入框发送
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) {
      Toast.warning({
        content: '请输入消息内容',
        duration: 1000,
      });
      return;
    }
    
    onMessageSend(inputValue.trim());
    setInputValue('');
  }, [inputValue, onMessageSend]);

  // 处理键盘事件
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 处理麦克风录音
  const handleMicrophoneClick = useCallback(() => {
    if (isRecording) {
      // 停止录音
      setIsRecording(false);
      // 这里可以添加停止录音的逻辑
      Toast.info({
        content: '录音已停止',
        duration: 1000,
      });
    } else {
      // 开始录音
      setIsRecording(true);
      Toast.info({
        content: '开始录音...',
        duration: 1000,
      });
      // 这里可以添加开始录音的逻辑
    }
  }, [isRecording]);

  // 处理侧边栏相关回调
  const handleSidebarToggle = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  const handleNewChatFromSidebar = useCallback(() => {
    if (onNewChat) {
      onNewChat();
    }
    setSidebarVisible(false);
  }, [onNewChat]);
   return (
    <div className="agent-chat-room">
      {/* 左上角侧边栏展开按钮 - 始终显示（除非侧边栏已展开） */}
      {!sidebarVisible && (
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
        renderChatBoxAction={() => null}
        markdownRenderProps={{
          className: 'chat-message-content'
        }}
      />
      
      {/* 固定定位的输入框 */}
      <div className="fixed-input-area">
        <div className="input-container">
          {/* 麦克风按钮 */}
          <div className="microphone-container">
            <Button
              theme={isRecording ? "solid" : "borderless"}
              type={isRecording ? "danger" : "tertiary"}
              icon={<IconMicrophone />}
              onClick={handleMicrophoneClick}
              className={`microphone-button ${isRecording ? 'recording' : ''}`}
              size="large"
            />
          </div>
          
          {/* 输入框和发送按钮 */}
          <Input
            value={inputValue}
            onChange={setInputValue}
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
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
                loading={isLoading}
              />
            }
          />
        </div>
      </div>

      {/* AI助手侧边栏 */}
      <AiChatSidebar
        visible={sidebarVisible}
        onCancel={handleSidebarClose}
        currentSessionId={agent.sessionId}
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