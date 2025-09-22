'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CharacterChat from '../../../components/CharacterChat/CharacterChat';

const CharacterChatPage: React.FC = () => {
  const params = useParams();
  const characterId = params.id as string;

  return (
    <div>
      <CharacterChat characterId={characterId} />
    </div>
  );
};

export default CharacterChatPage;