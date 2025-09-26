import { useState, useEffect, useRef, useCallback } from 'react';
import { SSEHandler } from '@/components/ChatRoom/SSEHandler';
import type { Agent, SSEMessage, ConnectionStatus, RecordingResult } from '../types';

/**
 * AgentChatRoom 组件的主要业务逻辑 Hook
 * 
 * 功能包括：
 * - 消息管理（发送、接收、显示）
 * - SSE 连接管理
 * - 音频播放控制
 * - 录音功能处理
 * - 连接状态管理
 */

export const useAgentChatRoom = (agent: Agent) => {
  // 状态管理
  const [messages, setMessages] = useState<SSEMessage[] | null>(null);  // 聊天消息列表
  const [isLoading, setIsLoading] = useState(false);        // 加载状态
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle'); // 连接状态
  const [isAnimated, setIsAnimated] = useState(false);      // 动画状态

  // Refs
  const sseHandlerRef = useRef<SSEHandler | null>(null);    // SSE 处理器引用
  const messageSeqRef = useRef(1);                          // 消息序列号引用

  // 会话活跃度更新
  useEffect(() => {
    // 定期更新会话的最后活跃时间，用于会话管理
    const updateActiveTime = () => {
      // 这里可以添加会话活跃时间更新逻辑
    };
    
    const interval = setInterval(updateActiveTime, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  // 初始化欢迎消息和动画
  useEffect(() => {
    if (!messages) {
      // 设置初始欢迎消息
      const welcomeMessage: SSEMessage = {
        id: 'welcome',
        content: `你好！我是 ${agent.name}，有什么可以帮助你的吗？`,
        role: 'assistant'
      };
      
      setMessages([welcomeMessage]);
      
      // 启动渐进动画
      setTimeout(() => setIsAnimated(true), 100);
    }
  }, [agent.name, messages]);

  /**
   * 生成唯一的消息ID
   * @returns 唯一的消息ID字符串
   */
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * 发送消息处理函数
   * @param content 消息内容
   */
  const onMessageSend = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setConnectionStatus('connecting');

      // 添加用户消息到消息列表
      const userMessage: SSEMessage = {
        id: generateMessageId(),
        role: 'user',
        content: content.trim(),
      };

      // 添加AI回复占位消息
      const aiMessage: SSEMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => prev ? [...prev, userMessage, aiMessage] : [userMessage, aiMessage]);

      // 这里应该调用实际的AI服务
      // 暂时模拟AI回复
      setTimeout(() => {
        setMessages(prev => {
          if (!prev) return prev;
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = `收到你的消息："${content}"，这是我的回复。`;
            lastMessage.isComplete = true;
          }
          return updatedMessages;
        });
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 1000);

    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setConnectionStatus('error');
    }
  }, [isLoading, generateMessageId]);

  /**
   * 处理录音完成的回调函数
   * @param result 录音结果，包含音频数据和转换的文本
   */
  const handleRecordingComplete = useCallback(async (result: RecordingResult) => {
    if (result.text && result.text.trim()) {
      // 如果录音转换出了文本，直接发送
      await onMessageSend(result.text.trim());
    }
  }, [onMessageSend]);

  /**
   * 清理资源的 useEffect
   * 在组件卸载时清理 SSE 连接等资源
   */
  useEffect(() => {
    return () => {
      if (sseHandlerRef.current) {
        sseHandlerRef.current.close();
      }
    };
  }, []);

  return {
    // 状态
    messages,
    isLoading,
    connectionStatus,
    isAnimated,
    
    // 方法
    onMessageSend,
    handleRecordingComplete
  };
};