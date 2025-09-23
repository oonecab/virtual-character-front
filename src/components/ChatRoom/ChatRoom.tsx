'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@douyinfe/semi-ui';
import { SSEHandler, SSEMessage } from './SSEHandler';

interface ChatRoomProps {
  sessionId: string;
}

const defaultMessage: SSEMessage[] = [];

const roleInfo = {
  user: {
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
  },
  assistant: {
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
  },
};

const commonOuterStyle = {
  border: '1px solid var(--semi-color-border)',
  borderRadius: '16px',
  height: 600,
};

let messageId = 0;
function getMessageId() {
  return `msg-${messageId++}`;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<SSEMessage[]>(defaultMessage);
  const sseHandlerRef = useRef<SSEHandler | null>(null);
  const messageSeqRef = useRef(1);

  // 初始化SSE处理器
  useEffect(() => {
    sseHandlerRef.current = new SSEHandler({
      onMessage: (content: string) => {
        // 更新最后一条消息的内容
        setMessages(prevMessages => {
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
        // 标记最后一条消息为完成状态
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.status !== 'complete') {
            const completedMessage = {
              ...lastMessage,
              content: finalContent || lastMessage.content,
              status: 'complete' as const
            };
            return [...prevMessages.slice(0, -1), completedMessage];
          }
          return prevMessages;
        });
      },
      onError: (error: Error) => {
        console.error('SSE处理错误:', error);
        // 标记最后一条消息为完成状态（错误情况下）
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.status !== 'complete') {
            const errorMessage = {
              ...lastMessage,
              content: lastMessage.content || '抱歉，发生了错误',
              status: 'complete' as const
            };
            return [...prevMessages.slice(0, -1), errorMessage];
          }
          return prevMessages;
        });
      }
    });

    return () => {
      if (sseHandlerRef.current) {
        sseHandlerRef.current.closeConnection();
      }
    };
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

  // 消息变化处理
  const onChatsChange = useCallback((chats: SSEMessage[]) => {
    setMessages(chats);
  }, []);

  // 停止生成处理
  const onStopGenerator = useCallback(() => {
    console.log('🛑 停止生成');
    if (sseHandlerRef.current) {
      sseHandlerRef.current.closeConnection();
      
      // 标记最后一条消息为完成状态
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.status && lastMessage.status !== 'complete') {
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

  return (
    <div className="chat-room">
      <Chat
        chats={messages}
        showStopGenerate={true}
        style={commonOuterStyle}
        onStopGenerator={onStopGenerator}
        roleConfig={roleInfo}
        onChatsChange={onChatsChange}
        onMessageSend={onMessageSend}
      />
    </div>
  );
};

export default ChatRoom;