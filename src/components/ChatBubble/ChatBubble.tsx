'use client';

import React, { useState, useCallback } from 'react';
import { Chat, Radio } from '@douyinfe/semi-ui';

interface ChatBubbleProps {
  messages?: any[];
  onMessageSend?: (content: string, attachment?: any) => void;
  onChatsChange?: (chats: any[]) => void;
  onMessageReset?: () => void;
  mode?: 'bubble' | 'noBubble' | 'userBubble';
  align?: 'leftRight' | 'leftAlign';
  style?: React.CSSProperties;
  showControls?: boolean;
}


const roleInfo = {
  user: {
    name: 'User',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
  },
  assistant: {
    name: 'Assistant',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
  },
};

const commonOuterStyle = {
  borderRadius: '16px',
  margin: '8px 16px',
  height: 550,
};

let id = 0;
function getId() {
  return `id-${id++}`;
}

const uploadProps = { action: 'https://api.semi.design/upload' };
const uploadTipProps = { content: '自定义上传按钮提示信息' };

const ChatBubble: React.FC<ChatBubbleProps> = ({
  messages = [],
  onMessageSend,
  onChatsChange,
  onMessageReset,
  mode = 'bubble',
  align = 'leftRight',
  style = commonOuterStyle,
  showControls = false
}) => {
  const [message, setMessage] = useState(messages);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentAlign, setCurrentAlign] = useState(align);

  const onAlignChange = useCallback((e: any) => {
    setCurrentAlign(e.target.value);
  }, []);

  const onModeChange = useCallback((e: any) => {
    setCurrentMode(e.target.value);
  }, []);

  const handleMessageSend = useCallback((content: string, attachment?: any) => {
    if (onMessageSend) {
      onMessageSend(content, attachment);
    } else {
      // 默认行为：添加用户消息和模拟AI回复
      const userMessage = {
        role: 'user',
        id: getId(),
        createAt: Date.now(),
        content: content,
      };
      
      const newAssistantMessage = {
        role: 'assistant',
        id: getId(),
        createAt: Date.now(),
        content: "这是一条 mock 回复信息",
      };
      
      setMessage(prev => [...prev, userMessage]);
      
      setTimeout(() => {
        setMessage(prev => [...prev, newAssistantMessage]);
      }, 1000);
    }
  }, [onMessageSend]);

  const handleChatsChange = useCallback((chats: any[]) => {
    setMessage(chats);
    if (onChatsChange) {
      onChatsChange(chats);
    }
  }, [onChatsChange]);

  const handleMessageReset = useCallback((e: any) => {
    if (onMessageReset) {
      onMessageReset();
    } else {
      setTimeout(() => {
        setMessage((message) => {
          const lastMessage = message[message.length - 1];
          const newLastMessage = {
            ...lastMessage,
            status: 'complete',
            content: 'This is a mock reset message.',
          };
          return [...message.slice(0, -1), newLastMessage];
        });
      }, 200);
    }
  }, [onMessageReset]);

  return (
    <div className="w-full" style={{
      animation: 'fadeIn 0.3s ease-in-out',
    }}>
      <style jsx>{`
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
        
        .semi-chat-chatBox {
          animation: slideInUp 0.4s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .semi-chat-chatBox:last-child {
          animation: slideInUp 0.5s ease-out;
        }
      `}</style>
      {showControls && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-3">
            <span>模式</span>
            <Radio.Group onChange={onModeChange} value={currentMode} type="button">
              <Radio value="bubble">气泡</Radio>
              <Radio value="noBubble">非气泡</Radio>
              <Radio value="userBubble">用户会话气泡</Radio>
            </Radio.Group>
          </div>
          <div className="flex items-center gap-3">
            <span>会话布局方式</span>
            <Radio.Group onChange={onAlignChange} value={currentAlign} type="button">
              <Radio value="leftRight">左右分布</Radio>
              <Radio value="leftAlign">左对齐</Radio>
            </Radio.Group>
          </div>
        </div>
      )}
      <Chat
        key={currentAlign + currentMode}
        align={currentAlign}
        mode={currentMode}
        uploadProps={uploadProps}
        style={style}
        chats={message}
        roleConfig={roleInfo}
        onChatsChange={handleChatsChange}
        onMessageSend={handleMessageSend}
        onMessageReset={handleMessageReset}
        uploadTipProps={uploadTipProps}
      />
    </div>
  );
};

export default ChatBubble;
export type { ChatBubbleProps };