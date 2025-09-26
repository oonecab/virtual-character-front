import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useChatManager = () => {
  const { user } = useAuth();
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // 获取问候语
  const getGreeting = () => {
    const username = user?.username || '用户';
    const hour = new Date().getHours();
    let timeGreeting = '你好';
    
    if (hour < 12) {
      timeGreeting = '早上好';
    } else if (hour < 18) {
      timeGreeting = '下午好';
    } else {
      timeGreeting = '晚上好';
    }
    
    return `${timeGreeting}，${username}`;
  };

  // 处理聊天消息发送
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

  // 处理聊天记录变化
  const handleChatsChange = (chats: any[]) => {
    setMessages(chats);
  };

  return {
    // 状态
    isChatMode,
    messages,
    
    // 方法
    getGreeting,
    handleChatMessageSend,
    handleChatsChange,
    
    // 状态设置器
    setIsChatMode,
    setMessages
  };
};