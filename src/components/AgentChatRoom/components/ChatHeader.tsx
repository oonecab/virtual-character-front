import React from 'react';
import { Button, Avatar, Typography } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import type { Agent, ConnectionStatus } from '../types';

const { Title, Text } = Typography;

/**
 * 聊天头部组件的属性接口
 */
interface ChatHeaderProps {
  /** Agent 信息 */
  agent: Agent;
  /** 连接状态 */
  connectionStatus: ConnectionStatus;
  /** 返回按钮点击回调 */
  onBack?: () => void;
  /** 是否显示会话ID（开发模式） */
  showSessionId?: boolean;
}

/**
 * 聊天头部组件
 * 
 * 功能：
 * - 显示 Agent 基本信息（头像、名称、描述）
 * - 显示连接状态指示器
 * - 提供返回导航功能
 * - 开发模式下显示会话ID
 * - 响应式布局适配
 */

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  agent,
  connectionStatus,
  onBack
}) => {
  // 连接状态指示器
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#52c41a';
      case 'connecting': return '#1890ff';
      case 'error': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '在线';
      case 'connecting': return '连接中';
      case 'error': return '连接失败';
      default: return '离线';
    }
  };

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'white',
      borderBottom: '1px solid #e8e8e8',
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* 返回按钮 */}
        <Button
          theme="borderless"
          icon={<IconArrowLeft />}
          onClick={onBack}
          size="large"
          style={{
            color: '#666',
            padding: '8px'
          }}
        />

        {/* Agent 头像 */}
        <Avatar
          size="large"
          style={{
            backgroundColor: '#1890ff',
            flexShrink: 0
          }}
        >
          {agent.avatar && agent.avatar.startsWith('http') ? (
            <img src={agent.avatar} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '20px' }}>{agent.avatar || '🤖'}</span>
          )}
        </Avatar>

        {/* Agent 信息 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title 
            heading={6} 
            style={{ 
              margin: 0, 
              fontSize: '16px',
              fontWeight: 600,
              color: '#333'
            }}
          >
            {agent.name}
          </Title>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px'
          }}>
            {/* 状态指示器 */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              flexShrink: 0
            }} />
            
            <Text 
              size="small" 
              type="tertiary"
              style={{ fontSize: '12px' }}
            >
              {getStatusText()}
            </Text>
            
            {agent.description && (
              <>
                <Text 
                  size="small" 
                  type="tertiary"
                  style={{ fontSize: '12px' }}
                >
                  •
                </Text>
                <Text 
                  size="small" 
                  type="tertiary"
                  ellipsis={{ showTooltip: true }}
                  style={{ 
                    fontSize: '12px',
                    maxWidth: '200px'
                  }}
                >
                  {agent.description}
                </Text>
              </>
            )}
          </div>
        </div>

        {/* 会话ID显示（开发模式） */}
        {process.env.NODE_ENV === 'development' && agent.sessionId && (
          <Text 
            size="small" 
            type="tertiary"
            code
            style={{ fontSize: '10px' }}
          >
            {agent.sessionId.slice(-8)}
          </Text>
        )}
      </div>
    </div>
  );
};