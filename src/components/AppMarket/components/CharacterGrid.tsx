import React from 'react';
import { Row, Button, Typography } from '@douyinfe/semi-ui';
import { AiCharacter } from '@/services/aiCharacterService';
import { CharacterCard } from './CharacterCard';

const { Text } = Typography;

interface CharacterGridProps {
  characters: AiCharacter[];
  loading: boolean;
  error: string | null;
  isAnimating: boolean;
  hasMore: boolean;
  onCharacterSelect: (character: AiCharacter) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  loading,
  error,
  isAnimating,
  hasMore,
  onCharacterSelect,
  onLoadMore,
  onRetry
}) => {
  if (loading && characters.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text>加载中...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text type="danger">{error}</Text>
        <Button 
          style={{ marginLeft: '16px' }} 
          onClick={onRetry}
        >
          重试
        </Button>
      </div>
    );
  }

  return (
    <>
      <Row gutter={[24, 24]}>
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={index}
            isAnimating={isAnimating}
            onSelect={onCharacterSelect}
          />
        ))}
      </Row>
      
      {/* 加载更多按钮 */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button 
            onClick={onLoadMore}
            loading={loading}
          >
            加载更多
          </Button>
        </div>
      )}
    </>
  );
};