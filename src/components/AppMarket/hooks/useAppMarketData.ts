import { useState, useCallback } from 'react';
import { AiCharacterService, type AiCharacter, type PageData } from '@/services/aiCharacterService';
import { LOCAL_AI_CHARACTERS } from '@/config/aiCharacters';

export const useAppMarketData = () => {
  const [aiCharacters, setAiCharacters] = useState<AiCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageData<AiCharacter> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadAiCharacters = useCallback(async (page: number = 1, search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 使用本地配置的AI角色数据
      let filteredCharacters = [...LOCAL_AI_CHARACTERS];
      
      if (search && search.trim()) {
        // 搜索模式 - 根据名称和描述进行模糊搜索
        const searchTerm = search.trim().toLowerCase();
        filteredCharacters = LOCAL_AI_CHARACTERS.filter(char => 
          char.aiName.toLowerCase().includes(searchTerm) ||
          char.description.toLowerCase().includes(searchTerm)
        );
        setAiCharacters(filteredCharacters);
        setPageData(null);
      } else {
        // 分页模式 - 模拟分页效果
        const pageSize = 12;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCharacters = filteredCharacters.slice(startIndex, endIndex);
        
        if (page === 1) {
          setAiCharacters(paginatedCharacters);
        } else {
          setAiCharacters(prev => [...prev, ...paginatedCharacters]);
        }
        
        // 模拟分页数据
        const mockPageData: PageData<AiCharacter> = {
          records: paginatedCharacters,
          total: filteredCharacters.length,
          size: pageSize,
          current: page,
          pages: Math.ceil(filteredCharacters.length / pageSize),
          optimizeCountSql: true,
          searchCount: true,
          optimizeJoinOfCountSql: true,
          maxLimit: 1000,
          countId: 'id',
          orders: []
        };
        
        setPageData(mockPageData);
        setCurrentPage(page);
      }
    } catch (err) {
      setError('加载AI角色失败，请稍后重试');
      console.error('加载AI角色失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pageData && currentPage < pageData.pages) {
      loadAiCharacters(currentPage + 1);
    }
  }, [pageData, currentPage, loadAiCharacters]);

  const retry = useCallback(() => {
    loadAiCharacters(1);
  }, [loadAiCharacters]);

  return {
    aiCharacters,
    loading,
    error,
    pageData,
    currentPage,
    loadAiCharacters,
    loadMore,
    retry,
    hasMore: pageData ? currentPage < pageData.pages : false
  };
};