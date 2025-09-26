import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@douyinfe/semi-ui';
import historyService from '../services/historyService';

interface SessionManagerOptions {
  loadHistory?: boolean;
  updateUrl?: boolean;
  setShowChatRoom?: boolean;
  setInitialMessage?: string;
  clearMessages?: boolean;
}

export const useSessionManager = () => {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);

  // 统一的sessionId管理方法
  const setSessionIdWithValidation = async (
    sessionId: string | null,
    options: SessionManagerOptions = {}
  ) => {
    const {
      loadHistory = false,
      updateUrl = true,
      setShowChatRoom: shouldShowChatRoom = false,
      setInitialMessage: initialMsg = '',
      clearMessages = false
    } = options;

    console.log('🔧 setSessionIdWithValidation 被调用', {
      sessionId,
      options,
      callStack: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });

    // sessionId 验证
    if (sessionId !== null) {
      if (typeof sessionId !== 'string') {
        console.error('❌ sessionId 必须是字符串类型，当前类型:', typeof sessionId);
        return;
      }
      if (sessionId.trim() === '') {
        console.error('❌ sessionId 不能为空字符串');
        return;
      }
    }

    // 避免重复设置相同的sessionId
    if (currentSessionId === sessionId) {
      console.log('⚠️ sessionId 相同，跳过设置:', sessionId);
      return;
    }

    console.log('📝 设置 sessionId 状态变化:', {
      from: currentSessionId,
      to: sessionId,
      timestamp: new Date().toISOString()
    });

    // 设置状态
    setCurrentSessionId(sessionId);
    
    if (shouldShowChatRoom) {
      setShowChatRoom(true);
    }
    
    if (initialMsg) {
      setInitialMessage(initialMsg);
    }

    if (clearMessages) {
      setCurrentMessages([]);
    }

    // 更新URL
    if (updateUrl) {
      if (sessionId) {
        router.push(`/ai-characters?sessionId=${sessionId}`);
      } else {
        router.push('/ai-characters');
      }
    }

    // 加载历史消息
    if (loadHistory && sessionId) {
      try {
        console.log('📚 开始加载历史消息，sessionId:', sessionId);
        const historyMessages = await historyService.getSessionHistory(sessionId);
        
        if (Array.isArray(historyMessages)) {
          console.log('✅ 历史消息加载成功，消息数量:', historyMessages.length);
          console.log('📋 原始历史消息格式:', historyMessages);
          
          // 使用historyService的convertToMessages方法转换消息格式
          const convertedMessages = historyService.convertToMessages(historyMessages);
          console.log('🔄 转换后的消息格式:', convertedMessages);
          
          setCurrentMessages(convertedMessages);
        } else {
          console.warn('⚠️ 历史消息格式不正确:', historyMessages);
          setCurrentMessages([]);
        }
      } catch (error) {
        console.error('❌ 加载历史消息失败:', error);
        Toast.error('加载历史消息失败');
        setCurrentMessages([]);
      }
    }
  };

  // 监听当前会话ID变化，仅用于清空消息
  useEffect(() => {
    console.log('🔄 currentSessionId useEffect 触发，currentSessionId:', currentSessionId);
    if (!currentSessionId) {
      console.log('🧹 清空 currentMessages');
      setCurrentMessages([]);
    }
  }, [currentSessionId]);

  // 从URL读取sessionId的useEffect - 添加路由监听
  useEffect(() => {
    const handleRouteChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdFromUrl = urlParams.get('sessionId');
      
      console.log('🔗 路由变化，从URL读取sessionId:', sessionIdFromUrl);
      console.log('🔍 当前sessionId:', currentSessionId);
      
      if (sessionIdFromUrl && sessionIdFromUrl !== currentSessionId) {
        console.log('🔄 URL中的sessionId与当前不同，开始切换');
        
        // 立即设置状态
        setCurrentSessionId(sessionIdFromUrl);
        setShowChatRoom(true);
        setInitialMessage('');
        
        // 异步加载历史消息
        const loadHistory = async () => {
          try {
            console.log('📚 开始加载历史消息，sessionId:', sessionIdFromUrl);
            const historyMessages = await historyService.getSessionHistory(sessionIdFromUrl);
            
            if (Array.isArray(historyMessages)) {
              console.log('✅ 历史消息加载成功，消息数量:', historyMessages.length);
              const convertedMessages = historyService.convertToMessages(historyMessages);
              setCurrentMessages(convertedMessages);
            } else {
              console.warn('⚠️ 历史消息格式不正确:', historyMessages);
              setCurrentMessages([]);
            }
          } catch (error) {
            console.error('❌ 加载历史消息失败:', error);
            setCurrentMessages([]);
          }
        };
        
        loadHistory();
      } else if (!sessionIdFromUrl && currentSessionId) {
        // 如果URL中没有sessionId但当前有sessionId，清空当前sessionId
        console.log('🔄 URL中没有sessionId，清空当前sessionId');
        setCurrentSessionId(null);
        setShowChatRoom(false);
        setCurrentMessages([]);
      }
    };

    // 初始检查
    handleRouteChange();
    
    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []); // 移除currentSessionId依赖，避免无限循环

  // 处理选择历史会话
  const handleSelectSession = async (sessionId: string) => {
    try {
      console.log('🔄 开始切换到历史会话:', sessionId);
      
      // 立即设置状态，确保同步更新
      setCurrentSessionId(sessionId);
      setShowChatRoom(true);
      setInitialMessage('');
      
      // 使用setTimeout确保状态更新完成后再导航
      setTimeout(() => {
        router.push(`/ai-characters?sessionId=${sessionId}`);
        console.log('✅ 已导航到历史会话页面');
      }, 0);
      
      // 加载历史消息
      try {
        console.log('📚 开始加载历史消息，sessionId:', sessionId);
        const historyMessages = await historyService.getSessionHistory(sessionId);
        
        if (Array.isArray(historyMessages)) {
          console.log('✅ 历史消息加载成功，消息数量:', historyMessages.length);
          const convertedMessages = historyService.convertToMessages(historyMessages);
          setCurrentMessages(convertedMessages);
        } else {
          console.warn('⚠️ 历史消息格式不正确:', historyMessages);
          setCurrentMessages([]);
        }
      } catch (error) {
        console.error('❌ 加载历史消息失败:', error);
        Toast.error('加载历史消息失败');
        setCurrentMessages([]);
      }
      
      Toast.success('已切换到历史会话');
    } catch (error) {
      console.error('❌ 切换历史会话失败:', error);
      Toast.error('切换历史会话失败');
    }
  };

  // 返回到主页面
  const handleBackToMain = () => {
    setSessionIdWithValidation(null, {
      setShowChatRoom: false,
      setInitialMessage: '',
      updateUrl: true
    });
  };

  // 处理新对话
  const handleNewChat = () => {
    console.log('🆕 开始新对话');
    
    // 立即设置状态，不等待异步操作
    setCurrentSessionId(null);
    setShowChatRoom(false);
    setInitialMessage('');
    setCurrentMessages([]);
    
    // 使用setTimeout确保状态更新完成后再导航
    setTimeout(() => {
      router.push('/ai-characters');
      console.log('✅ 新对话状态重置完成，已导航到主页');
    }, 0);
  };

  return {
    // 状态
    currentSessionId,
    showChatRoom,
    initialMessage,
    currentMessages,
    
    // 方法
    setSessionIdWithValidation,
    handleSelectSession,
    handleBackToMain,
    handleNewChat,
    
    // 状态设置器（用于特殊情况）
    setShowChatRoom,
    setInitialMessage,
    setCurrentMessages
  };
};