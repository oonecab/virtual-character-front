import { useState, useCallback, useRef, useEffect } from 'react';
import { Toast } from '@douyinfe/semi-ui';

// 输入框管理hook
export const useInputValue = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const clear = useCallback(() => {
    setValue('');
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, onSubmit?: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit && value.trim()) {
        onSubmit();
      }
    }
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    clear,
    handleKeyPress,
    textareaRef,
    isEmpty: !value.trim(),
  };
};

// 语音输入hook
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const newState = !isListening;
    setIsListening(newState);
    // console.log('麦克风状态:', newState ? '开启' : '关闭');
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    toggleListening,
    stopListening,
  };
};

// 模态框管理hook
export const useModal = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLogin = useCallback(() => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  }, []);

  const openRegister = useCallback(() => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  }, []);

  const closeAll = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  }, []);

  const switchToLogin = useCallback(() => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  }, []);

  return {
    showLoginModal,
    showRegisterModal,
    openLogin,
    openRegister,
    closeAll,
    switchToRegister,
    switchToLogin,
  };
};

// 侧边栏管理hook
export const useSidebar = () => {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  return {
    visible,
    open,
    close,
    toggle,
  };
};

// 问候语hook
export const useGreeting = (username?: string) => {
  const getGreeting = useCallback(() => {
    const displayName = username || '用户';
    const hour = new Date().getHours();
    let timeGreeting = '你好';
    
    if (hour < 12) {
      timeGreeting = '早上好';
    } else if (hour < 18) {
      timeGreeting = '下午好';
    } else {
      timeGreeting = '晚上好';
    }
    
    return `${timeGreeting}，${displayName}`;
  }, [username]);

  return { getGreeting };
};