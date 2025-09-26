import React from 'react';
import { Card, Typography, Col } from '@douyinfe/semi-ui';
import { AiCharacter } from '@/services/aiCharacterService';

const { Title, Text } = Typography;

interface CharacterCardProps {
  character: AiCharacter;
  index: number;
  isAnimating: boolean;
  onSelect: (character: AiCharacter) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  index,
  isAnimating,
  onSelect
}) => {
  return (
    <Col span={8}>
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
        onClick={() => onSelect(character)}
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
              {character.aiAvatar ? (
                <img 
                  src={character.aiAvatar} 
                  alt={character.aiName}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                '🤖'
              )}
            </div>
            <Title heading={6} style={{ 
              margin: '0 0 8px 0', 
              color: '#FF6B35',
              fontSize: '16px',
              fontWeight: 600
            }}>
              {character.aiName}
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
                创建时间: {new Date(character.createTime).toLocaleDateString()}
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );
};