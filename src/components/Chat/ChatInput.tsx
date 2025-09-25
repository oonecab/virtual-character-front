import React from 'react';
import { Button, TextArea } from '@douyinfe/semi-ui';
import { IconSend, IconMicrophone } from '@douyinfe/semi-icons';
import { useInputValue, useVoiceInput } from '../../hooks/useChat';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "输入你的问题...",
  className = "",
}) => {
  const {
    value,
    handleChange,
    clear,
    handleKeyPress,
    textareaRef,
    isEmpty,
  } = useInputValue();

  const { isListening, toggleListening } = useVoiceInput();

  const handleSend = () => {
    if (!isEmpty && !disabled) {
      onSend(value);
      clear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyPress(e, handleSend);
  };

  return (
    <div className={`chat-input-container ${className}`}>
      <div className="chat-input-wrapper">
        <TextArea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autosize={{ minRows: 1, maxRows: 4 }}
          className="chat-input"
          style={{
            resize: 'none',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          }}
        />
        
        <div className="chat-input-actions">
          <Button
            icon={<IconMicrophone />}
            type={isListening ? "primary" : "tertiary"}
            size="small"
            onClick={toggleListening}
            disabled={disabled}
            className="voice-button"
            style={{
              color: isListening ? '#fff' : '#666',
              backgroundColor: isListening ? '#1890ff' : 'transparent',
            }}
          />
          
          <Button
            icon={<IconSend />}
            type="primary"
            size="small"
            onClick={handleSend}
            disabled={disabled || isEmpty}
            className="send-button"
          />
        </div>
      </div>
      
      <style jsx>{`
        .chat-input-container {
          width: 100%;
          padding: 16px;
          border-top: 1px solid #e8e8e8;
          background: #fff;
        }
        
        .chat-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          background: #fff;
          transition: border-color 0.3s;
        }
        
        .chat-input-wrapper:focus-within {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        
        .chat-input {
          flex: 1;
          min-height: 20px;
          max-height: 120px;
          line-height: 1.5;
        }
        
        .chat-input-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        
        .voice-button,
        .send-button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .voice-button:hover {
          background-color: #f5f5f5;
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ChatInput;