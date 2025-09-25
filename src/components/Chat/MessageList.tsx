import React, { useEffect, useRef } from 'react';
import { Avatar, Typography } from '@douyinfe/semi-ui';
import { IconUser, IconComment } from '@douyinfe/semi-icons';
import { ChatMessage } from '../../contexts/ChatContext';

const { Text } = Typography;

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
  className?: string;
}

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message-item ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        <Avatar
          size="small"
          style={{
            backgroundColor: isUser ? '#1890ff' : '#52c41a',
            color: '#fff',
          }}
        >
          {isUser ? <IconUser /> : <IconComment />}
        </Avatar>
      </div>
      
      <div className="message-content">
        <div className="message-bubble">
          <Text>{message.content}</Text>
        </div>
        <div className="message-time">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      <style jsx>{`
        .message-item {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease-in;
        }
        
        .user-message {
          flex-direction: row-reverse;
        }
        
        .message-avatar {
          flex-shrink: 0;
        }
        
        .message-content {
          flex: 1;
          max-width: 70%;
        }
        
        .user-message .message-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        
        .user-message .message-bubble {
          background: #1890ff;
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        
        .ai-message .message-bubble {
          background: #f5f5f5;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
          padding: 0 4px;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const LoadingMessage: React.FC = () => (
  <div className="message-item ai-message">
    <div className="message-avatar">
      <Avatar size="small" style={{ backgroundColor: '#52c41a', color: '#fff' }}>
        <IconComment />
      </Avatar>
    </div>
    
    <div className="message-content">
      <div className="message-bubble loading-bubble">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <style jsx>{`
      .loading-bubble {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 12px;
        border-bottom-left-radius: 4px;
      }
      
      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      
      .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite ease-in-out;
      }
      
      .typing-indicator span:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .typing-indicator span:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  loading = false, 
  className = "" 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={`message-list ${className}`}>
      <div className="messages-container">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {loading && <LoadingMessage />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <style jsx>{`
        .message-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #fff;
        }
        
        .messages-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .message-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .message-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .message-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .message-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default MessageList;