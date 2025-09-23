'use client';

import React, { useState } from 'react';
import { SideSheet, Button, Typography, Toast } from '@douyinfe/semi-ui';
import { IconSetting, IconClose, IconSend } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

interface AiChatSidebarProps {
  visible: boolean;
  onCancel: () => void;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  onStartChat?: (message: string) => void; // 新增：开始聊天的回调
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ 
  visible, 
  onCancel, 
  placement = 'left',
  onStartChat
}) => {
  const [inputValue, setInputValue] = useState('');

  // AI角色扮演点击处理
  const handleAiRolePlayClick = () => {
    console.log('AI角色扮演功能');
    Toast.info('AI角色扮演功能开发中...');
  };

  // 开始聊天
  const handleStartChat = () => {
    if (!inputValue.trim()) {
      Toast.warning('请输入消息内容');
      return;
    }

    const message = inputValue.trim();
    setInputValue(''); // 清空输入框
    
    // 调用父组件的回调函数
    if (onStartChat) {
      onStartChat(message);
    }
    
    // 关闭侧边栏
    onCancel();
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartChat();
    }
  };

  return (
    <SideSheet 
      title={null}
      visible={visible} 
      onCancel={() => {}} 
      placement={placement}
      width={320}
      mask={false}
      disableScroll={false}
      closeIcon={false}
      closable={false}
      style={{ 
        backgroundColor: '#fff',
        borderLeft: '1px solid #f0f0f0'
      }}
    >
      {/* 侧边栏内容容器 */}
      <div style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* 头部区域 */}
        <div style={{ 
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 标题 */}
          <Title heading={5} style={{ 
            margin: '0', 
            color: '#1C1F23', 
            fontWeight: 600
          }}>
            AI 助手
          </Title>
          
          {/* 右上角关闭按钮 */}
          <Button 
            icon={<IconClose />} 
            theme="borderless" 
            size="small"
            onClick={onCancel}
            style={{ 
              color: '#666',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
          />
        </div>

        {/* 快速导航区域 */}
        <div style={{ 
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Text type="tertiary" size="small" style={{ color: '#8A8F8D', marginBottom: '12px', display: 'block' }}>
            快速导航
          </Text>
          <Text type="tertiary" size="small" style={{ color: '#999', marginBottom: '16px', display: 'block' }}>
            选择你需要的功能
          </Text>
          
          <Button
            theme="light"
            type="primary"
            icon={<IconSetting />}
            onClick={handleAiRolePlayClick}
            block
            size="large"
            style={{
              height: '48px',
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
              backgroundColor: '#fafafa',
              color: '#1C1F23',
              fontWeight: 400,
              transition: 'all 0.2s ease'
            }}
          >
            AI 角色扮演
          </Button>
        </div>

        {/* 聊天启动区域 */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <Text type="tertiary" size="small" style={{ color: '#8A8F8D', marginBottom: '8px', display: 'block' }}>
              开始对话
            </Text>
            <Text type="tertiary" size="small" style={{ color: '#999' }}>
              输入你的问题，开始与AI助手对话
            </Text>
          </div>

        </div>
      </div>

    </SideSheet>
  );
};

export default AiChatSidebar;