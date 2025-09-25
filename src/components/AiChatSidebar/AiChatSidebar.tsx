'use client';

import React, { useState, useEffect } from 'react';
import {
    SideSheet,
    Button,
    Typography,
    List,
    Spin,
    Input,
    Toast,
    Empty
} from '@douyinfe/semi-ui';
import {
    IconClose,
    IconComment,
    IconHistory,
    IconPlus,
    IconSend
} from '@douyinfe/semi-icons';
import AiChatService, { Message, ChatSession } from '../../services/aiChatService';
import historyService, { ConversationSession, HistoryMessage } from '../../services/historyService';
import { Message as ChatMessage, Session as ChatSessionType } from '../../contexts/ChatContext';
import "./AiChatSidebar.css"

const { Text } = Typography;

interface AiChatSidebarProps {
  visible: boolean;
  onCancel: () => void;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  onStartChat?: (message: string) => void; // 新增：开始聊天的回调
  currentSessionId?: string | null; // 当前会话ID
  currentMessages?: ChatMessage[]; // 当前会话的消息历史
  onSelectSession?: (sessionId: string) => void; // 新增：选择历史会话的回调
  onNewChat?: () => void; // 新增：新对话的回调
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ 
  visible, 
  onCancel, 
  placement = 'left',
  onStartChat,
  currentSessionId,
  currentMessages = [],
  onSelectSession,
  onNewChat
}) => {
  const [inputValue, setInputValue] = useState('');
  const [userSessions, setUserSessions] = useState<ChatSession[]>([]);
  const [conversationSessions, setConversationSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取用户会话列表
  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      const sessions = await AiChatService.getUserSessions();
      setUserSessions(sessions);
    } catch (error) {
      console.error('获取用户会话失败:', error);
      Toast.error('获取用户会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取历史会话列表
  const fetchConversationSessions = async () => {
    try {
      setLoading(true);
      const result = await historyService.getConversations({
        current: 1,
        size: 20,
        status: 1 // 只获取进行中的会话
      });
      setConversationSessions(result.records);
    } catch (error) {
      console.error('获取历史会话失败:', error);
      Toast.error('获取历史会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 首次打开侧边栏时拉取历史对话
  useEffect(() => {
    if (visible && conversationSessions.length === 0) {
      fetchConversationSessions();
    }
  }, [visible]);

// 处理选择历史会话
  const handleSelectSession = async (sessionId: string) => {
    try {
      console.log('🎯 AiChatSidebar: 点击历史会话卡片:', sessionId);
      
      if (onSelectSession) {
        console.log('📞 调用 onSelectSession 回调');
        onSelectSession(sessionId);
      } else {
        console.warn('⚠️ onSelectSession 回调未定义');
      }
      
      // 关闭侧边栏
      onCancel();
    } catch (error) {
      console.error('❌ 选择会话失败:', error);
      Toast.error('选择会话失败');
    }
  };

  // 格式化时间显示
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  // 渲染当前会话消息
  const renderCurrentMessages = () => {
    if (!currentSessionId) {
      return (
        <Empty
          image={<IconComment size="large" />}
          title="暂无会话"
          description="开始新的对话来查看消息历史"
        />
      );
    }

    if (!currentMessages || currentMessages.length === 0) {
      return (
        <Empty
          image={<IconComment size="large" />}
          title="暂无消息"
          description="当前会话还没有消息"
        />
      );
    }

    return (
      <List
        dataSource={currentMessages}
        renderItem={(message: Message) => (
          <List.Item
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <div style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <Text
                  type={message.role === 'user' ? 'primary' : 'secondary'}
                  size="small"
                  style={{ fontWeight: 500 }}
                >
                  {message.role === 'user' ? '我' : 'AI助手'}
                </Text>
                <Text type="tertiary" size="small" style={{ marginLeft: '8px' }}>
                  {formatTime(message.timestamp)}
                </Text>
              </div>
              <Text
                style={{
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: '#333',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {message.content}
              </Text>
            </div>
          </List.Item>
        )}
      />
    );
  };

  // 渲染历史会话列表
  const renderHistorySessions = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!userSessions || userSessions.length === 0) {
      return (
        <Empty
          image={<IconHistory size="large" />}
          title="暂无历史会话"
          description="开始新的对话来创建历史记录"
        />
      );
    }

    return (
      <List
        dataSource={userSessions}
        renderItem={(session: ChatSession) => (
          <List.Item
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer'
            }}
            onClick={() => {
              // 这里可以添加点击会话的处理逻辑
            }}
          >
            <div style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <Text
                  style={{
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#333',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {session.title || `会话 ${session.sessionId.slice(-6)}`}
                </Text>
                <Text type="tertiary" size="small">
                  {formatTime(session.updatedAt || session.createdAt || new Date())}
                </Text>
              </div>
              <Text
                type="secondary"
                size="small"
                style={{
                  fontSize: '12px',
                  color: '#666'
                }}
              >
                会话ID: {session.sessionId.slice(-8)}
              </Text>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
      <SideSheet
          title={null}
          visible={visible}
          onCancel={onCancel}
          placement="left"
          width={280}
          mask={false}
          disableScroll={false} // 修复：允许页面滚动，只在侧边栏内部控制滚动
          closeIcon={false}
          closable={false}
          className="ai-chat-sidebar-sheet"
          style={{
              backgroundColor: '#fafafa',
              border: 'none',
              zIndex: 9999,
              height: '100vh',
          }}
      >
      {/* 侧边栏内容容器 */}
          <div style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fafafa',
              overflow: 'hidden', // 防止侧边栏内容溢出
          }}>
              {/* 头部区域（关闭按钮、按钮组）- 高度固定 */}
              <div style={{
                  padding: '0px 0px 12px 16px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: '#fafafa',
                  height: 'auto',
                  flexShrink: 0,
              }}>
          <Button 
            icon={<IconClose />} 
            theme="borderless" 
            size="small"
            onClick={onCancel}
            style={{
              color: '#666',
              padding: '4px',
              borderRadius: '4px'
            }}
          />
        </div>
          {/* 按钮区域 - 固定高度，不参与滚动 */}
          <div style={{ 
            padding: '0 16px', 
            flexShrink: 0,
            backgroundColor: '#fafafa'
          }}>
          {/* AI角色扮演按钮 */}
          <div style={{ marginBottom: '16px' }}>
              <Button
                  theme="solid"
                  type="primary"
                  icon={<IconPlus />}
                  onClick={() => {
                      setInputValue('');
                      // 可以添加新对话逻辑
                  }}
                  block
                  size="large"
                  style={{
                      height: '40px',
                      borderRadius: '20px',
                      backgroundColor: '#000000',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500
                  }}
              >
                  AI角色扮演
              </Button>
          </div>

          {/* AI面试按钮 */}
          <div style={{ marginBottom: '16px' }}>
              <Button
                  theme="solid"
                  type="primary"
                  icon={<IconPlus />}
                  onClick={() => {
                      setInputValue('');
                      // 可以添加新对话逻辑
                  }}
                  block
                  size="large"
                  style={{
                      height: '40px',
                      borderRadius: '20px',
                      backgroundColor: '#000000',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500
                  }}
              >
                  AI面试
              </Button>
          </div>
        {/* 新对话按钮 */}
        <div style={{ marginBottom: '16px' }}>
          <Button
            theme="solid"
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              setInputValue('');
              // 调用新对话回调
              if (onNewChat) {
                onNewChat();
              }
              // 关闭侧边栏
              onCancel();
            }}
            block
            size="large"
            style={{
              height: '40px',
              borderRadius: '20px',
              backgroundColor: '#000000',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            新对话
          </Button>
        </div>
        </div>
              {/* 历史对话区域（关键：限制高度，内部滚动） */}
              <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  overflow: 'hidden',
              }}>
                {/* 历史对话标题 - 固定不滚动 */}
                <div style={{
                  padding: '16px 16px 8px 16px',
                  backgroundColor: '#fafafa',
                  flexShrink: 0
                }}>
                  <Text style={{ 
                    fontSize: '13px',
                    color: '#666',
                    display: 'block'
                  }}>
                    历史对话
                  </Text>
                </div>
                
                {/* 可滚动的历史记录列表 */}
                <div 
                  className="history-scroll-area"
                  style={{
                    flex: 1,
                    padding: '0 8px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    minHeight: 0,
                  }}
                >
          
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100px'
            }}>
              <Spin size="small" />
            </div>
          ) : conversationSessions.length === 0 ? (
             <Empty
               image={<IconComment size="large" style={{ opacity: 0.5 }} />}
               description="暂无历史对话"
               style={{
                 textAlign: 'center',
                 padding: '40px 20px',
                 color: '#999'
               }}
             />
           ) : (
            <List
              dataSource={conversationSessions}
              renderItem={(session: ConversationSession) => (
                <List.Item
                  style={{
                    padding: '8px',
                    margin: '2px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: currentSessionId === session.sessionId ? '#e6f7ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (currentSessionId !== session.sessionId) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentSessionId !== session.sessionId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => {
                    console.log('🖱️ 用户点击历史会话卡片:', session.sessionId);
                    console.log('📋 会话详情:', session);
                    handleSelectSession(session.sessionId);
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <IconComment size="small" style={{ color: '#666', flexShrink: 0 }} />
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#1a1a1a',
                          fontWeight: currentSessionId === session.sessionId ? 500 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {session.title || `对话 ${session.sessionId.slice(-6)}`}
                      </Text>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {historyService.formatTime(session.lastMessageTime || session.createTime)}
                      </Text>
                      {session.messageCount > 0 && (
                        <Text
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            marginLeft: '8px'
                          }}
                        >
                          {session.messageCount}条消息
                        </Text>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
          </div>
          </div>
      </div>
    </SideSheet>
  );
};

export default AiChatSidebar;