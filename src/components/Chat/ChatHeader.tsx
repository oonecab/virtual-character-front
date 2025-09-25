import React from 'react';
import { Button, Typography, Space } from '@douyinfe/semi-ui';
import { IconMenu, IconPlus, IconArrowLeft } from '@douyinfe/semi-icons';

const { Title } = Typography;

interface ChatHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNewChatButton?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  onNewChat?: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "AI 助手",
  showBackButton = false,
  showMenuButton = true,
  showNewChatButton = true,
  onBack,
  onMenuClick,
  onNewChat,
  className = "",
}) => {
  return (
    <div className={`chat-header ${className}`}>
      <div className="header-left">
        {showBackButton && (
          <Button
            icon={<IconArrowLeft />}
            type="tertiary"
            size="large"
            onClick={onBack}
            className="back-button"
          />
        )}
        
        {showMenuButton && (
          <Button
            icon={<IconMenu />}
            type="tertiary"
            size="large"
            onClick={onMenuClick}
            className="menu-button"
          />
        )}
        
        <Title heading={4} className="header-title">
          {title}
        </Title>
      </div>
      
      <div className="header-right">
        {showNewChatButton && (
          <Button
            icon={<IconPlus />}
            type="tertiary"
            size="large"
            onClick={onNewChat}
            className="new-chat-button"
          />
        )}
      </div>
      
      <style jsx>{`
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e8e8e8;
          background: #fff;
          min-height: 60px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .header-title {
          margin: 0 !important;
          color: #333;
          font-weight: 600;
        }
        
        .back-button,
        .menu-button,
        .new-chat-button {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .back-button:hover,
        .menu-button:hover,
        .new-chat-button:hover {
          background-color: #f5f5f5;
        }
        
        @media (max-width: 768px) {
          .chat-header {
            padding: 8px 12px;
            min-height: 56px;
          }
          
          .header-title {
            font-size: 16px;
          }
          
          .back-button,
          .menu-button,
          .new-chat-button {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatHeader;