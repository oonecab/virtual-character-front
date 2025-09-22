'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconMicrophone, IconSend } from '@douyinfe/semi-icons';

const SimpleChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('发送消息:', inputValue);
      setInputValue('');
    }
  };

  const handleMicrophoneClick = () => {
    setIsListening(!isListening);
    // 这里可以添加语音识别逻辑
    console.log('麦克风状态:', !isListening ? '开启' : '关闭');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        {/* 问候区域 */}
        <div className="text-center mb-5">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3 leading-tight">
            下午好，你感觉如何
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            我想要和你聊天，让我们开始吧
          </p>
        </div>
        
        {/* 输入区域 */}
        <div className="w-full flex flex-col items-center gap-5">
          <div className="w-full flex flex-col items-center gap-4">
            {/* 输入框容器 */}
            <div className="w-full relative bg-white border-2 border-gray-200 rounded-3xl shadow-sm hover:border-gray-300 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="输入你的消息..."
                className="w-full resize-none border-none outline-none bg-transparent text-lg px-6 py-4 pr-14 min-h-[60px] max-h-40 overflow-y-auto"
                rows={1}
              />
              <Button
                theme="borderless"
                icon={<IconSend />}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:bg-blue-50 rounded-full p-2 disabled:text-gray-300"
              />
            </div>
            
            {/* 麦克风按钮 */}
            <div className="flex justify-center">
              <Button
                theme={isListening ? 'solid' : 'borderless'}
                type={isListening ? 'primary' : 'tertiary'}
                icon={<IconMicrophone />}
                onClick={handleMicrophoneClick}
                className={`rounded-2xl px-6 py-3 text-sm font-medium border-2 transition-all duration-200 ${
                  isListening 
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse shadow-lg' 
                    : 'text-gray-600 bg-white border-gray-200 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'
                }`}
                size="large"
              >
                {isListening ? '停止录音' : '语音输入'}
              </Button>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default SimpleChat;