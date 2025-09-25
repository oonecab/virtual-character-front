'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@douyinfe/semi-ui';
import AiChatService from '../services/aiChatService';
import historyService from '../services/historyService';

// 消息类型定义
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 会话类型定义
export interface ChatSession {
  sessionId: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 聊天状态类型
export interface ChatState {
  // 当前会话
  currentSessionId: string | null;
  currentMessages: ChatMessage[];
  
  // 会话列表
  sessions: ChatSession[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // 页面状态
  currentView: 'home' | 'chat';
  initialMessage: string;
}

// Action类型定义
export type ChatAction =
  | { type: 'SET_CURRENT_SESSION'; payload: { sessionId: string | null; messages?: ChatMessage[] } }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VIEW'; payload: 'home' | 'chat' }
  | { type: 'SET_INITIAL_MESSAGE'; payload: string }
  | { type: 'RESET_STATE' };

// 初始状态
const initialState: ChatState = {
  currentSessionId: null,
  currentMessages: [],
  sessions: [],
  isLoading: false,
  error: null,
  currentView: 'home',
  initialMessage: '',
};

// Reducer函数
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSessionId: action.payload.sessionId,
        currentMessages: action.payload.messages || [],
        currentView: action.payload.sessionId ? 'chat' : 'home',
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload],
      };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        currentMessages: action.payload,
      };
    
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };
    
    case 'SET_INITIAL_MESSAGE':
      return {
        ...state,
        initialMessage: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context类型定义
interface ChatContextType {
  state: ChatState;
  
  // 会话管理
  createNewSession: (firstMessage: string) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  
  // 消息管理
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  
  // 导航管理
  goToHome: () => void;
  goToChat: (sessionId?: string) => void;
  
  // 工具方法
  clearError: () => void;
}

// 创建Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider组件
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const router = useRouter();

  // URL同步效果
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('sessionId');
    
    if (sessionIdFromUrl && sessionIdFromUrl !== state.currentSessionId) {
      selectSession(sessionIdFromUrl);
    } else if (!sessionIdFromUrl && state.currentSessionId) {
      dispatch({ type: 'SET_CURRENT_SESSION', payload: { sessionId: null } });
    }
  }, []);

  // 创建新会话
  const createNewSession = async (firstMessage: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const session = await AiChatService.createSession(firstMessage);
      if (session?.sessionId) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: { sessionId: session.sessionId } });
        dispatch({ type: 'SET_INITIAL_MESSAGE', payload: firstMessage });
        
        // 更新URL
        router.push(`/ai-characters?sessionId=${session.sessionId}`);
        
        Toast.success('新会话创建成功');
      }
    } catch (error) {
      console.error('创建会话失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '创建会话失败，请重试' });
      Toast.error('创建会话失败，请重试');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 选择会话
  const selectSession = async (sessionId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // 加载历史消息
      const historyMessages = await historyService.getSessionHistory(sessionId);
      const convertedMessages = historyService.convertToMessages(historyMessages || []);
      
      dispatch({ 
        type: 'SET_CURRENT_SESSION', 
        payload: { sessionId, messages: convertedMessages } 
      });
      
      // 更新URL
      router.push(`/ai-characters?sessionId=${sessionId}`);
      
      Toast.success('已切换到历史会话');
    } catch (error) {
      console.error('切换会话失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '切换会话失败' });
      Toast.error('切换会话失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 加载会话列表
  const loadSessions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const sessions = await historyService.getUserSessions();
      dispatch({ type: 'SET_SESSIONS', payload: sessions || [] });
    } catch (error) {
      console.error('加载会话列表失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '加载会话列表失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!state.currentSessionId) {
      Toast.error('请先创建会话');
      return;
    }

    try {
      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      
      // 这里可以添加发送消息到服务器的逻辑
      // const response = await AiChatService.sendMessage(state.currentSessionId, content);
      
    } catch (error) {
      console.error('发送消息失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '发送消息失败' });
      Toast.error('发送消息失败');
    }
  };

  // 添加消息
  const addMessage = (message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  // 导航到首页
  const goToHome = () => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: { sessionId: null } });
    dispatch({ type: 'SET_INITIAL_MESSAGE', payload: '' });
    router.push('/ai-characters');
  };

  // 导航到聊天页面
  const goToChat = (sessionId?: string) => {
    if (sessionId) {
      selectSession(sessionId);
    } else {
      dispatch({ type: 'SET_VIEW', payload: 'chat' });
    }
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: ChatContextType = {
    state,
    createNewSession,
    selectSession,
    loadSessions,
    sendMessage,
    addMessage,
    goToHome,
    goToChat,
    clearError,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook for using chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};