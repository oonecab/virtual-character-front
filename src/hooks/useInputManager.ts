import { useState, useRef, useEffect } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import AiChatService from '../services/aiChatService';

export const useInputManager = () => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 添加useEffect来监听inputValue的变化
  useEffect(() => {
    console.log('🔍 inputValue 状态变化:', inputValue);
  }, [inputValue]);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // 清空输入框
  const clearInput = () => {
    setInputValue('');
  };

  // 处理麦克风点击
  const handleMicrophoneClick = () => {
    setIsListening(!isListening);
  };

  // 处理键盘按键
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 这里需要外部传入handleSend函数，或者在组件中直接处理
    }
  };

  // 创建新的AI会话
  const createNewSession = async (firstMessage: string): Promise<string | null> => {
    try {
      const session = await AiChatService.createSession(firstMessage);
      return session ? session.sessionId : null;
    } catch (error) {
      Toast.error('创建会话失败，请重试');
      return null;
    }
  };

  return {
    // 状态
    inputValue,
    isListening,
    textareaRef,
    
    // 方法
    handleInputChange,
    clearInput,
    handleMicrophoneClick,
    handleKeyPress,
    createNewSession,
    
    // 状态设置器
    setInputValue,
    setIsListening
  };
};