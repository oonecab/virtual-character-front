import { useState, useCallback } from 'react';
import { AiCharacterService, type AiCharacter, type PageData } from '@/services/aiCharacterService';

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
      if (search && search.trim()) {
        // 搜索模式
        const searchResults = await AiCharacterService.searchAiCharacters(search.trim());
        setAiCharacters(searchResults);
        setPageData(null);
      } else {
        // 分页模式
        const result = await AiCharacterService.getAiCharacterPage({
          current: page,
          size: 12
        });
        
        if (page === 1) {
          setAiCharacters(result.records);
        } else {
          setAiCharacters(prev => [...prev, ...result.records]);
        }
        setPageData(result);
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