'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, Typography, Space, Row, Col, Button } from '@douyinfe/semi-ui';
import { IconSearch, IconClose } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

interface AppMarketProps {
  visible: boolean;
  onClose?: () => void;
  onSelectCharacter?: (character: any) => void;
}

const AppMarket: React.FC<AppMarketProps> = ({ visible, onClose, onSelectCharacter }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  // 处理动画状态
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // 延迟一帧开始进入动画
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // 等待退出动画完成后再卸载组件
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 动画持续时间
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  // 处理角色选择
  const handleCharacterSelect = (character: any) => {
    if (onSelectCharacter) {
      onSelectCharacter(character);
    }
  };
  
  // AI角色数据
  const aiCharacters = [
    {
      id: 1,
      name: 'Java开发工程师',
      description: '专业的Java开发专家，擅长Spring Boot、微服务架构',
      avatar: '👨‍💻',
      rating: 4.8,
      usage: '1.2万人使用',
      tags: ['编程', '后端'],
      color: '#FF6B35'
    },
    {
      id: 2,
      name: '编程忍者',
      description: '全栈开发专家，精通多种编程语言和框架',
      avatar: '🥷',
      rating: 4.9,
      usage: '8.5千人使用',
      tags: ['编程', '全栈'],
      color: '#4ECDC4'
    },
    {
      id: 3,
      name: 'AI问答',
      description: '智能问答助手，帮你解答各种问题',
      avatar: '🤖',
      rating: 4.7,
      usage: '2.1万人使用',
      tags: ['问答', '通用'],
      color: '#45B7D1'
    },
  ];

  // 过滤角色
  const filteredCharacters = aiCharacters.filter(character =>
    character.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    character.description.toLowerCase().includes(searchValue.toLowerCase())
  );

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
      {/* 居中的主容器盒子 */}
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
        <div style={{
          textAlign: 'center',
          padding: '30px 40px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Input
            placeholder="搜索 AI 角色..."
            value={searchValue}
            onChange={setSearchValue}
            prefix={<IconSearch />}
            style={{ 
              width: '400px', 
              height: '48px',
              borderRadius: '24px',
              fontSize: '16px'
            }}
            size="large"
          />
        </div>

        {/* 角色列表区域 */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto'
        }}>
          <Row gutter={[24, 24]}>
            {filteredCharacters.map((character, index) => (
              <Col span={8} key={character.id}>
                <Card
                    style={{
                      height: '220px',
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white',
                      opacity: isAnimating ? 1 : 0,
                      transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
                      transitionDelay: isAnimating ? `${index * 0.1}s` : '0s'
                    }}
                    bodyStyle={{
                      padding: '20px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    hoverable
                    onClick={() => handleCharacterSelect(character)}
                  >
                  <div style={{ 
                    textAlign: 'center', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between' 
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '40px', 
                        marginBottom: '12px',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}>
                        {character.avatar}
                      </div>
                      <Title heading={6} style={{ 
                        margin: '0 0 8px 0', 
                        color: character.color,
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        {character.name}
                      </Title>
                      <Text size="small" type="tertiary" style={{ 
                        display: 'block', 
                        marginBottom: '16px', 
                        height: '36px', 
                        overflow: 'hidden',
                        lineHeight: '18px'
                      }}>
                        {character.description}
                      </Text>
                    </div>
                    
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '16px',
                        marginBottom: '12px'
                      }}>
                        <Text size="small" type="secondary">
                          ⭐ {character.rating}
                        </Text>
                        <Text size="small" type="secondary">
                          {character.usage}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default AppMarket;