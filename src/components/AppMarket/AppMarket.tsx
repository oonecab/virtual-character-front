'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography } from '@douyinfe/semi-ui';
import { useUIManager } from '../../hooks';
import { AiCharacter } from '@/services/aiCharacterService';
import { AppMarketProps } from './types';
import { useAppMarketData, useAppMarketAnimation } from './hooks';
import { SearchSection, CharacterGrid } from './components';

const { Title, Text } = Typography;

/**
 * AI角色市场组件
 * 提供AI角色的浏览、搜索和选择功能
 */
const AppMarket: React.FC<AppMarketProps> = ({ visible, onClose, onSelectCharacter }) => {
  const [searchValue, setSearchValue] = useState('');
  const { handleAgentChatRoomOpen } = useUIManager();
  
  // 使用自定义hooks管理状态和逻辑
  const { isAnimating, shouldRender } = useAppMarketAnimation(visible);
  const {
    aiCharacters,
    loading,
    error,
    loadAiCharacters,
    loadMore,
    retry,
    hasMore
  } = useAppMarketData();

  // 组件显示时加载数据
  useEffect(() => {
    if (visible) {
      loadAiCharacters();
    }
  }, [visible, loadAiCharacters]);

  /**
   * 处理角色选择
   * 将AiCharacter转换为AgentInfo格式并打开聊天室
   */
  const handleCharacterSelect = (character: AiCharacter) => {
    const agentInfo = {
      id: character.id,
      name: character.aiName,
      avatar: character.aiAvatar || '🤖',
      description: character.description,
      prompt: character.aiPrompt
    };
    
    // 优先调用传入的回调函数
    if (onSelectCharacter) {
      onSelectCharacter(agentInfo);
    } else {
      // 如果没有传入回调，则直接打开 AgentChatRoom
      handleAgentChatRoomOpen(agentInfo);
    }
  };

  /**
   * 处理搜索
   * 支持实时搜索和清空搜索
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      loadAiCharacters(1, value);
    } else {
      loadAiCharacters(1);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      opacity: isAnimating ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '1000px',
          height: '100vh',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: 'white',
          overflow: 'hidden',
          transform: isAnimating ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-in-out'
        }}
        bodyStyle={{
          padding: '0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 标题区域 */}
        <div style={{
          textAlign: 'center',
          padding: '40px 40px 20px 40px',
          borderBottom: '1px solid #f0f0f0',
          position: 'relative'
        }}>
          <Title heading={2} style={{ margin: '0 0 16px 0', color: '#333' }}>
            AI 角色广场
          </Title>
          <Text type="secondary" size="large">
            发现更多有趣的 AI 角色
          </Text>
        </div>

        {/* 搜索区域 */}
        <SearchSection 
          searchValue={searchValue}
          onSearch={handleSearch}
        />

        {/* 角色列表区域 */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto'
        }}>
          <CharacterGrid
            characters={aiCharacters}
            loading={loading}
            error={error}
            isAnimating={isAnimating}
            hasMore={hasMore}
            onCharacterSelect={handleCharacterSelect}
            onLoadMore={loadMore}
            onRetry={retry}
          />
        </div>
      </Card>
    </div>
  );
};

export default AppMarket;