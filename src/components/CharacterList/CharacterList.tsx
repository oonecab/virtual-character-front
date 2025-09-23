'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Avatar, Typography, Input, Button, Tag, Space } from '@douyinfe/semi-ui';
import { IconSearch, IconComment, IconUser, IconStar, IconMenu } from '@douyinfe/semi-icons';
import AiChatSidebar from '../AiChatSidebar/AiChatSidebar';
import './CharacterList.css';

const { Title, Text, Paragraph } = Typography;

interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  popularity: number;
  conversations: number;
  tags: string[];
  rating: number;
}

const CharacterList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 模拟角色数据
  const characters: Character[] = [
    {
      id: '1',
      name: '测试智能体',
      description: '这是一个用于测试的AI智能体，可以进行基本的对话和交互功能测试。',
      avatar: '🤖',
      category: '测试',
      popularity: 4.0,
      conversations: 100,
      tags: ['测试', 'AI', '对话'],
      rating: 4.0
    }
  ];

  const categories = ['全部', '测试'];

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || character.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleChatClick = (character: Character) => {
    console.log('开始与', character.name, '聊天');
    // TODO: 实现聊天功能
  };

  return (
    <div className="character-list-container">
      <div className="header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title heading={2} className="page-title">发现 AI 智能体</Title>
          <Button
            theme="borderless"
            icon={<IconMenu />}
            onClick={() => setSidebarVisible(true)}
            size="large"
            style={{ 
              color: '#1890ff',
              border: '1px solid #d9d9d9',
              borderRadius: '8px'
            }}
          >
            AI 助手
          </Button>
        </div>
        <div className="search-section">
          <Input
            placeholder="搜索角色名称或描述"
            showClear
            size="large"
            prefix={<IconSearch />}
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            className="search-input"
          />
          <Button theme="solid" size="large" className="create-btn">
            + 创建 AI 智能体
          </Button>
        </div>
        <div className="category-tabs">
          {categories.map(category => (
            <Button
              key={category}
              theme={selectedCategory === category ? 'solid' : 'borderless'}
              onClick={() => setSelectedCategory(category)}
              className="category-btn"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Row gutter={[24, 24]} className="character-grid">
        {filteredCharacters.map(character => (
          <Col xs={24} sm={12} md={8} lg={6} key={character.id}>
            <Card
              className="character-card"
              hoverable={true}
              cover={
                <div className="character-avatar-section">
                  <Avatar size={64} className="character-avatar">
                    {character.avatar}
                  </Avatar>
                </div>
              }
              actions={[
                <Button
                  key="chat"
                  theme="solid"
                  icon={<IconComment />}
                  onClick={() => handleChatClick(character)}
                  className="chat-btn"
                >
                  开始聊天
                </Button>
              ]}
            >
              <div className="character-info">
                <Title heading={4} className="character-name">{character.name}</Title>
                <Paragraph className="character-description" ellipsis={{ rows: 2 }}>
                  {character.description}
                </Paragraph>
                <div className="character-stats">
                  <Space size="middle">
                    <span className="stat-item">
                      <IconStar /> {character.rating}
                    </span>
                    <span className="stat-item">
                      <IconUser /> {character.conversations.toLocaleString()}
                    </span>
                  </Space>
                </div>
                <div className="character-tags">
                  {character.tags.slice(0, 3).map(tag => (
                    <Tag key={tag} className="character-tag">{tag}</Tag>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredCharacters.length === 0 && (
        <div className="empty-state">
          <Text type="secondary">没有找到匹配的角色，请尝试其他搜索词</Text>
        </div>
      )}

      {/* AI 聊天侧边栏 */}
      <AiChatSidebar
        visible={sidebarVisible}
        onCancel={() => setSidebarVisible(false)}
        placement="right"
      />
    </div>
  );
};

export default CharacterList;