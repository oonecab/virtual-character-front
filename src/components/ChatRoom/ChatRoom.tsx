'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, Input, Button, Spin, Toast } from '@douyinfe/semi-ui';
import { IconSend } from '@douyinfe/semi-icons';
import { SSEHandler, SSEMessage } from './SSEHandler';
import './ChatRoom.css';

interface ChatRoomProps {
  sessionId: string;
  initialMessage?: string;
  onBack?: () => void;
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

const ChatRoom: React.FC<ChatRoomProps> = ({ sessionId, initialMessage, onBack }) => {
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
        // 标记最后一条消息为错误状态
        setMessages(prevMessages => {
          if (!prevMessages || prevMessages.length === 0) return prevMessages;
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const errorMessage = {
              ...lastMessage,
              content: '抱歉，发生了错误，请重试。',
              status: 'complete' as const
            };
            return [...prevMessages.slice(0, -1), errorMessage];
          }
          return prevMessages;
        });
      }
    });

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
  }, [initialMessage]);

  // 生成唯一消息ID
  const getMessageId = useCallback(() => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 生成消息ID:', id);
    return id;
  }, []);
  
  // 发送消息处理
  const onMessageSend = useCallback(async (content: string, attachment?: any) => {
    console.log('📤 发送消息:', content);
    
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

    // 启动SSE连接
    if (sseHandlerRef.current) {
      // 延迟一下，确保消息已经添加到状态中
      setTimeout(async () => {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            status: 'incomplete' as const
          };
          return [...prevMessages.slice(0, -1), updatedMessage];
        });
        
        await sseHandlerRef.current?.startConnection(
          sessionId,
          content,
          messageSeqRef.current++
        );
      }, 100);
    }
  }, [sessionId]);

  // 停止生成处理
  const onStopGenerator = useCallback(() => {
    console.log('⏹️ 停止生成');
    if (sseHandlerRef.current) {
      sseHandlerRef.current.closeConnection();
      
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
    }
  }, []);

  // 处理输入框发送
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
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

  return (
    <div className="chat-room">
      {/* 聊天内容区域 */}
      <Chat
        chats={messages}
        style={isAnimated ? animatedStyle : commonOuterStyle}
        onStopGenerator={onStopGenerator}
        roleConfig={roleInfo}
        showStopGenerate = {false}
        showClearContext = {false}
       />
      
      {/* 固定定位的输入框 */}
      <div className="fixed-input-area">
        <div className="input-container">
          <Input
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="输入你的消息..."
            size="large"
            className="chat-input"
            suffix={
              <Button
                theme="solid"
                type="primary"
                icon={<IconSend />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="send-button"
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;