'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, Input, Button, Spin, Toast, MarkdownRender } from '@douyinfe/semi-ui';
import { IconSend } from '@douyinfe/semi-icons';
import {SSEHandler, SSEMessage} from './SSEHandler';
import './ChatRoom.css';

interface ChatRoomProps {
  sessionId: string;
  initialMessage?: string;
  onBack?: () => void;
  historyMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

// 连接状态类型
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

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
    // 移除固定的minHeight，让内容自然撑开，避免影响侧边栏布局
    paddingBottom: '120px', // 为固定输入框留出空间
};

const animatedStyle = {
  ...commonOuterStyle,
  opacity: 1,
  transform: 'translateY(0)',
};

const ChatRoom: React.FC<ChatRoomProps> = ({ sessionId, initialMessage, onBack, historyMessages }) => {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isAnimated, setIsAnimated] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const sseHandlerRef = useRef<SSEHandler | null>(null);
  const messageSeqRef = useRef(1);
  
  // 初始化SSE处理器
  useEffect(() => {
    sseHandlerRef.current = new SSEHandler({
      onMessage: (content: string) => {
        // 更新最后一条消息的内容
        setMessages(prevMessages => {
          if (!prevMessages) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.status === 'incomplete') {
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
        console.log('✅ SSE完成:', finalContent);
        setIsLoading(false);
        // 标记最后一条消息为完成状态
        setMessages(prevMessages => {
          if (!prevMessages || prevMessages.length === 0) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const completedMessage = {
              ...lastMessage,
              content: finalContent,
              status: 'complete' as const
            };
            return [...prevMessages.slice(0, -1), completedMessage];
          }
          return prevMessages;
        });
      },
      onError: (error: Error) => {
        console.error('❌ SSE错误:', error);
        setIsLoading(false);
        setConnectionStatus('error');
        
        // 显示错误提示
        Toast.error({
          content: `连接错误: ${error.message}`,
          duration: 3000,
        });
        
        // 标记最后一条消息为错误状态
        setMessages(prevMessages => {
          if (!prevMessages || prevMessages.length === 0) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const errorMessage = {
              ...lastMessage,
              content: '抱歉，发生了错误，请重试。',
              status: 'error' as const
            };
            return [...prevMessages.slice(0, -1), errorMessage];
          }
          return prevMessages;
        });
      },
      onStatusChange: (status) => {
        console.log('🔄 连接状态变化:', status);
        setConnectionStatus(status);
        
        // 添加详细的状态变化日志
        if (status === 'disconnected') {
          console.log('⚠️ SSE连接断开，可能触发回退逻辑');
          console.trace('📍 disconnected状态调用栈:');
        }
      }
    });

    // 如果有历史消息，先加载历史消息
    if (historyMessages && historyMessages.length > 0) {
      const convertedMessages: SSEMessage[] = historyMessages.map((msg, index) => ({
        id: `history_${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        status: 'complete' as const
      }));
      setMessages(convertedMessages);
      messageSeqRef.current = historyMessages.length + 1;
    }

    // 启动渐进动画
    const animationTimer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    // 如果有初始消息，在动画完成后自动发送
    if (initialMessage) {
      const autoSendTimer = setTimeout(() => {
        onMessageSend(initialMessage);
      }, 800); // 等待动画完成后发送

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(autoSendTimer);
      };
    }

    return () => {
      clearTimeout(animationTimer);
    };
  }, [initialMessage, historyMessages]);

  // 生成唯一消息ID
  const getMessageId = useCallback(() => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 生成消息ID:', id);
    return id;
  }, []);
  
  // 发送消息处理
  const onMessageSend = useCallback(async (content: string, attachment?: any) => {
    console.log('📤 发送消息:', content);
    
    // 检查是否正在加载中
    if (isLoading) {
      Toast.warning({
        content: '请等待当前消息完成后再发送',
        duration: 2000,
      });
      return;
    }
    
    // 添加用户消息
    const userMessage: SSEMessage = {
      role: 'user',
      id: getMessageId(),
      createAt: Date.now(),
      content: content
    };

    // 添加助手消息（加载状态）
    const assistantMessage: SSEMessage = {
      role: 'assistant',
      id: getMessageId(),
      createAt: Date.now(),
      content: '',
      status: 'loading'
    };

    setMessages(prevMessages => [
      ...prevMessages,
      userMessage,
      assistantMessage
    ]);

    setIsLoading(true);

    // 启动SSE连接
    if (sseHandlerRef.current) {
      // 立即更新消息状态为不完整，并启动连接
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const updatedMessage = {
          ...lastMessage,
          status: 'incomplete' as const
        };
        return [...prevMessages.slice(0, -1), updatedMessage];
      });
      
      try {
        await sseHandlerRef.current.startConnection(
          sessionId,
          content,
          messageSeqRef.current++
        );
      } catch (error) {
        console.error('❌ 启动连接失败:', error);
        setIsLoading(false);
        Toast.error({
          content: '发送消息失败，请重试',
          duration: 3000,
        });
      }
    }
  }, [sessionId, isLoading, getMessageId]);

  // 停止生成处理
  const onStopGenerator = useCallback(() => {
    console.log('⏹️ 停止生成');
    if (sseHandlerRef.current) {
      sseHandlerRef.current.closeConnection();
      setIsLoading(false);
      
      // 将最后一条消息标记为完成
      setMessages(prevMessages => {
        if (!prevMessages || prevMessages.length === 0) return prevMessages;
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.status !== 'complete') {
          const stoppedMessage = {
            ...lastMessage,
            status: 'complete' as const
          };
          return [...prevMessages.slice(0, -1), stoppedMessage];
        }
        return prevMessages;
      });
      
      Toast.info({
        content: '已停止生成',
        duration: 1000,
      });
    }
  }, []);

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

  // 清理资源
  useEffect(() => {
    return () => {
      if (sseHandlerRef.current) {
        sseHandlerRef.current.closeConnection();
      }
    };
  }, []);





  return (
    <div className="chat-room">
      {/* 聊天内容区域 */}
      <Chat
        chats={messages}
        style={isAnimated ? animatedStyle : commonOuterStyle}
        onStopGenerator={onStopGenerator}
        roleConfig={roleInfo}
        showStopGenerate={false}
        showClearContext={false}
        showInput={false}
        inputAreaProps={{ style: { display: 'none' } }}
        renderChatBoxAction={() => null}
        markdownRenderProps={{
            className: 'chat-message-content' // 自定义样式类名
        }}
      />
      
      {/* 固定定位的输入框 */}
      <div className="fixed-input-area">
        <div className="input-container">
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
    </div>
  );
};

export default ChatRoom;