import React from 'react';
import { Avatar, Typography, Button } from '@douyinfe/semi-ui';
import { IconUser, IconVolumeUp } from '@douyinfe/semi-icons';
import type { SSEMessage } from '../types';
import {Spin} from "antd";

const { Text } = Typography;

/**
 * 消息项组件的属性接口
 */
interface MessageItemProps {
  /** 消息数据 */
  message: SSEMessage;
  /** 是否显示音频播放按钮 */
  showAudioButton?: boolean;
  /** 音频播放回调函数 */
  onPlayAudio?: (content: string) => void;
  /** 是否正在播放音频 */
  isPlaying?: boolean;
}

/**
 * 单个消息项组件
 * 
 * 功能：
 * - 显示用户或AI的消息内容
 * - 支持音频播放功能（仅AI消息）
 * - 区分消息状态（完成/进行中）
 * - 响应式布局适配
 */

export const MessageItem: React.FC<MessageItemProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const isIncomplete = message.status === 'incomplete';
  const isError = message.status === 'error';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: '16px',
        gap: '12px'
      }}
    >
      {/* 头像 */}
      <Avatar
        size="small"
        style={{
          backgroundColor: isUser ? '#1890ff' : '#52c41a',
          flexShrink: 0
        }}
      >
        {isUser ? <IconUser /> : '🤖'}
      </Avatar>

      {/* 消息内容 */}
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: isUser ? '#1890ff' : '#f6f7f9',
          color: isUser ? 'white' : '#333',
          wordBreak: 'break-word',
          lineHeight: '1.5',
          position: 'relative',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {/* 错误状态显示 */}
        {isError && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginBottom: '4px' }}>
            ⚠️ 发送失败
          </div>
        )}
        
        {/* 消息文本 */}
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </div>

        {/* 加载状态 */}
        {isIncomplete && isLast && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginTop: '8px',
            gap: '8px'
          }}>
            <Spin size="small" />
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              正在输入...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};