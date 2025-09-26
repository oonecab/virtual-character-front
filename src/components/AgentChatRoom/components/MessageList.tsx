import React, { useEffect, useRef } from 'react';
import { Empty } from '@douyinfe/semi-ui';
import { MessageItem } from './MessageItem';
import type { SSEMessage } from '../types';
import {Spin} from "antd";

/**
 * 消息列表组件的属性接口
 */
interface MessageListProps {
  /** 消息列表数据 */
  messages: SSEMessage[] | null;
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 是否启用动画效果 */
  isAnimated?: boolean;
  /** 音频播放回调函数 */
  onPlayAudio?: (content: string) => void;
  /** 是否正在播放音频 */
  isPlaying?: boolean;
}

/**
 * 消息列表组件
 * 
 * 功能：
 * - 显示所有聊天消息
 * - 自动滚动到最新消息
 * - 空状态展示
 * - 支持动画效果
 * - 消息音频播放控制
 */
export const MessageList: React.FC<MessageListProps> = ({ 
  messages,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 空状态
  if (!messages || messages.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <Empty
          image={<span style={{ fontSize: '48px' }}>🤖</span>}
          title="开始对话"
          description="发送消息开始与AI助手对话"
        />
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 消息列表 */}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
        />
      ))}
      
      {/* 滚动锚点 */}
      <div ref={messagesEndRef} />
    </div>
  );
};