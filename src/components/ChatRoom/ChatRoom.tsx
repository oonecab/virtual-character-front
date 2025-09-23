'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Input, Avatar, Toast, Space, Layout } from '@douyinfe/semi-ui';
import { IconSend, IconUser, IconArrowLeft } from '@douyinfe/semi-icons';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Header, Content, Footer } = Layout;

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  conversationTitle: string;
}

interface ChatRoomProps {
  sessionId?: string;
  onBack?: () => void;
  initialMessage?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ 
  sessionId: propSessionId, 
  onBack,
  initialMessage 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingContent, setTypingContent] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(propSessionId || null);
  const [messageSeq, setMessageSeq] = useState(0);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 获取URL中的sessionId
  const getSessionIdFromUrl = (): string | null => {
    return searchParams.get('sessionId');
  };

  // 更新URL中的sessionId
  const updateUrlWithSessionId = (sessionId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sessionId', sessionId);
    window.history.pushState({}, '', url.toString());
  };

  // 创建新的AI会话
  const createNewSession = async (firstMessage: string): Promise<ChatSession | null> => {
    try {
      const response = await fetch('/api/xunzhi/v1/ai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'user',
          aiId: 1,
          firstMessage: firstMessage
        })
      });

      if (!response.ok) {
        throw new Error('创建会话失败');
      }

      const result = await response.json();
      if (result.code === '200' || result.code === 'SUCCESS') {
        return result.data;
      } else {
        throw new Error(result.message || '创建会话失败');
      }
    } catch (error) {
      console.error('创建会话错误:', error);
      Toast.error('创建会话失败，请重试');
      return null;
    }
  };

  // SSE聊天
  const sendMessageWithSSE = (sessionId: string, message: string) => {
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsLoading(true);
    setIsTyping(true);
    setTypingContent('');

    // 根据接口文档，使用GET方法创建SSE连接，参数通过URL传递
    const params = new URLSearchParams({
      sessionId: sessionId,
      inputMessage: message,
      aiId: '1',
      messageSeq: (messageSeq + 1).toString(),
      userName: 'user'
    });
    
    const url = `/api/xunzhi/v1/ai/sessions/${sessionId}/chat?${params.toString()}`;
    const es = new EventSource(url);
    
    eventSourceRef.current = es;

    let fullContent = '';

    // 处理SSE消息
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'content') {
          // 打字机效果 - 累积内容
          fullContent += data.content;
          setTypingContent(fullContent);
        } else if (data.type === 'done') {
          // 消息完成
          const finalContent = fullContent || data.content || '';
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            content: finalContent,
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setMessageSeq(prev => prev + 1);
          setIsLoading(false);
          setIsTyping(false);
          setTypingContent('');
          es.close();
        }
      } catch (error) {
        console.error('解析SSE数据错误:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE连接错误:', error);
      Toast.error('连接中断，请重试');
      setIsLoading(false);
      setIsTyping(false);
      es.close();
    };
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // 添加用户消息到列表
    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setMessageSeq(prev => prev + 1);

    // 检查是否有sessionId
    let currentSessionId = sessionId || getSessionIdFromUrl();
    
    if (!currentSessionId) {
      // 创建新会话
      const newSession = await createNewSession(messageContent);
      if (newSession) {
        currentSessionId = newSession.sessionId;
        setSessionId(currentSessionId);
        updateUrlWithSessionId(currentSessionId);
      } else {
        return; // 创建失败，不继续
      }
    }

    // 发送SSE消息
    sendMessageWithSSE(currentSessionId, messageContent);
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 处理初始消息的发送
  const handleInitialMessage = async (message: string) => {
    // 添加用户消息到列表
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date()
    };
    setMessages([userMessage]);
    setMessageSeq(1);

    // 创建新会话并发送消息
    const newSession = await createNewSession(message);
    if (newSession) {
      setSessionId(newSession.sessionId);
      updateUrlWithSessionId(newSession.sessionId);
      // 发送初始消息到AI
      sendMessageWithSSE(newSession.sessionId, message);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingContent]);

  // 组件卸载时关闭SSE连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 初始化时处理initialMessage
  useEffect(() => {
    if (initialMessage && !sessionId) {
      handleInitialMessage(initialMessage);
    }
  }, [initialMessage]);

  // 初始化sessionId
  useEffect(() => {
    if (!sessionId && !initialMessage) {
      const urlSessionId = getSessionIdFromUrl();
      if (urlSessionId) {
        setSessionId(urlSessionId);
      }
    }
  }, [sessionId, initialMessage]);

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 头部 */}
      <Card 
        style={{ 
          margin: 0,
          borderRadius: 0,
          borderBottom: '1px solid #e8e8e8'
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <Button 
                icon={<IconArrowLeft />} 
                theme="borderless" 
                onClick={onBack}
                style={{ padding: '8px' }}
              />
            )}
            <Title heading={4} style={{ margin: 0 }}>
              AI 助手
            </Title>
            {sessionId && (
              <Text type="tertiary" size="small">
                会话ID: {sessionId.slice(-8)}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* 聊天区域 */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 消息列表 */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 && !isTyping && (
            <div style={{ 
              textAlign: 'center',
              padding: '64px 32px',
              color: '#999'
            }}>
              <Text type="tertiary" size="large">
                👋 你好！我是AI助手
              </Text>
              <br />
              <Text type="tertiary" style={{ marginTop: '12px' }}>
                有什么可以帮助你的吗？
              </Text>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: '70%',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <Avatar 
                  size="default" 
                  style={{
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#f0f0f0',
                    color: message.role === 'user' ? '#fff' : '#666',
                    flexShrink: 0
                  }}
                >
                  {message.role === 'user' ? <IconUser /> : 'AI'}
                </Avatar>
                <Card
                  style={{
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#fff',
                    color: message.role === 'user' ? '#fff' : '#333',
                    border: message.role === 'user' ? 'none' : '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  bodyStyle={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}
                >
                  {message.content}
                </Card>
              </div>
            </div>
          ))}
          
          {/* 打字机效果显示 */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: '70%'
              }}>
                <Avatar 
                  size="default" 
                  style={{
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                    flexShrink: 0
                  }}
                >
                  AI
                </Avatar>
                <Card
                  style={{
                    backgroundColor: '#fff',
                    color: '#333',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  bodyStyle={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                    minHeight: '20px'
                  }}
                >
                  {typingContent}
                  {isLoading && (
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#666',
                      borderRadius: '50%',
                      marginLeft: '4px',
                      animation: 'blink 1s infinite'
                    }} />
                  )}
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <Card 
          style={{ 
            margin: 0,
            borderRadius: 0,
            borderTop: '1px solid #e8e8e8'
          }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div style={{ 
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <TextArea
              ref={textareaRef}
              value={inputValue}
              onChange={(value) => setInputValue(value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              autosize={{ minRows: 1, maxRows: 4 }}
              disabled={isLoading}
              style={{
                flex: 1,
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
            />
            <Button
              theme="solid"
              type="primary"
              icon={<IconSend />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              loading={isLoading}
              style={{
                borderRadius: '8px',
                height: '40px',
                minWidth: '40px'
              }}
            />
          </div>
        </Card>
      </div>
      
      {/* 添加打字机动画样式 */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;