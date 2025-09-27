import { useState, useEffect, useRef, useCallback } from 'react';
import { SSEHandler } from '@/components/ChatRoom/SSEHandler';
import type { Agent, SSEMessage, ConnectionStatus, RecordingResult } from '../types';
import { CozeWorkflowSSEHandler, CozeWorkflowService } from '../../../services/cozeWorkflowService';

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
  const cozeSSEHandlerRef = useRef<CozeWorkflowSSEHandler | null>(null);    // Coze工作流SSE处理器引用
  const messageSeqRef = useRef(1);                          // 消息序列号引用

  // 初始化Coze工作流SSE处理器
  useEffect(() => {
    cozeSSEHandlerRef.current = new CozeWorkflowSSEHandler({
      onMessage: (content: string) => {
        // 更新最后一条消息的内容
        setMessages(prevMessages => {
          if (!prevMessages) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content + content
            };
            return [...prevMessages.slice(0, -1), updatedMessage];
          }
          return prevMessages;
        });
      },
      onComplete: (finalContent: string) => {
        console.log('✅ Coze工作流完成:', finalContent);
        setIsLoading(false);
        setConnectionStatus('connected');
        
        // 标记最后一条消息为完成状态
        setMessages(prevMessages => {
          if (!prevMessages) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessage = {
              ...lastMessage,
              status: 'complete' as const
            };
            return [...prevMessages.slice(0, -1), updatedMessage];
          }
          return prevMessages;
        });
      },
      onError: (error: Error) => {
        console.error('❌ Coze工作流错误:', error);
        setIsLoading(false);
        setConnectionStatus('error');
        
        // 更新最后一条消息为错误状态
        setMessages(prevMessages => {
          if (!prevMessages) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content || '抱歉，处理您的请求时出现了错误，请稍后重试。',
              status: 'error' as const
            };
            return [...prevMessages.slice(0, -1), updatedMessage];
          }
          return prevMessages;
        });
      },
      onStatusChange: (status) => {
        console.log('🔄 Coze工作流连接状态变化:', status);
        setConnectionStatus(status);
      }
    });

    // 清理函数
    return () => {
      if (cozeSSEHandlerRef.current) {
        cozeSSEHandlerRef.current.closeConnection();
      }
    };
  }, []);

  // 初始化欢迎消息和动画
  useEffect(() => {
    if (!messages) {
      // 设置初始欢迎消息
      const welcomeMessage: SSEMessage = {
        id: 'welcome',
        content: `你好！我是 ${agent?.name || '智能助手'}，有什么可以帮助你的吗？`,
        role: 'assistant'
      };
      
      setMessages([welcomeMessage]);
      
      // 启动渐进动画
      setTimeout(() => setIsAnimated(true), 100);
    }
  }, [agent?.name, messages]);

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
        createAt: Date.now()
      };

      // 添加AI回复占位消息
      const aiMessage: SSEMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '',
        createAt: Date.now(),
        status: 'loading'
      };

      setMessages(prev => prev ? [...prev, userMessage, aiMessage] : [userMessage, aiMessage]);

      // 获取工作流ID（根据agent类型或名称）
      const workflowId = CozeWorkflowService.getWorkflowId(agent.name || 'default');
      console.log('🎭 Agent名称:', agent.name);
      console.log('🚀 使用工作流ID:', workflowId, '处理消息:', content);

      // 启动Coze工作流SSE连接
      if (cozeSSEHandlerRef.current) {
        // 立即更新消息状态为不完整，并启动连接
        setMessages(prevMessages => {
          if (!prevMessages) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            status: 'incomplete' as const
          };
          return [...prevMessages.slice(0, -1), updatedMessage];
        });
        
        try {
          await cozeSSEHandlerRef.current.startConnection(workflowId, content);
        } catch (error) {
          console.error('❌ 启动Coze工作流连接失败:', error);
          setIsLoading(false);
          setConnectionStatus('error');
          
          // 更新最后一条消息为错误状态
          setMessages(prevMessages => {
            if (!prevMessages) return prevMessages;
            const lastMessage = prevMessages[prevMessages.length - 1];
            const updatedMessage = {
              ...lastMessage,
              content: '抱歉，无法连接到AI服务，请稍后重试。',
              status: 'error' as const
            };
            return [...prevMessages.slice(0, -1), updatedMessage];
          });
        }
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setConnectionStatus('error');
    }
  }, [isLoading, generateMessageId, agent.name]);

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
      if (cozeSSEHandlerRef.current) {
        cozeSSEHandlerRef.current.closeConnection();
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