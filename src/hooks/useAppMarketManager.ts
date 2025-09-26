import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AppMarketManagerOptions {
  updateUrl?: boolean;
  setInitialCharacter?: string;
}

export const useAppMarketManager = () => {
  const router = useRouter();
  const [showAppMarket, setShowAppMarket] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // 统一的AppMarket状态管理方法
  const setAppMarketState = useCallback((
    show: boolean,
    options: AppMarketManagerOptions = {}
  ) => {
    const {
      updateUrl = true,
      setInitialCharacter = null
    } = options;

    console.log('🔧 setAppMarketState 被调用', {
      show,
      options,
      currentState: showAppMarket
    });

    // 避免重复设置相同的状态
    if (showAppMarket === show) {
      console.log('⚠️ AppMarket状态相同，跳过设置:', show);
      return;
    }

    console.log('📝 设置 AppMarket 状态变化:', {
      from: showAppMarket,
      to: show,
      timestamp: new Date().toISOString()
    });

    // 设置状态
    setShowAppMarket(show);
    
    if (setInitialCharacter) {
      setSelectedCharacter(setInitialCharacter);
    }

    // 如果关闭AppMarket，清空搜索和选中状态
    if (!show) {
      setSearchValue('');
      setSelectedCharacter(null);
    }

    // 更新URL
    if (updateUrl) {
      if (show) {
        router.push('/ai-characters?view=appmarket');
      } else {
        router.push('/ai-characters');
      }
    }
  }, [showAppMarket, router]);

  // 打开AppMarket
  const handleAppMarketOpen = useCallback(() => {
    console.log('🎭 打开 AppMarket');
    setAppMarketState(true);
  }, [setAppMarketState]);

  // 关闭AppMarket
  const handleAppMarketClose = useCallback(() => {
    console.log('❌ 关闭 AppMarket');
    setAppMarketState(false);
  }, [setAppMarketState]);

  // 切换AppMarket状态
  const handleAppMarketToggle = useCallback(() => {
    console.log('🔄 切换 AppMarket 状态，当前:', showAppMarket);
    setAppMarketState(!showAppMarket);
  }, [showAppMarket, setAppMarketState]);

  // 选择角色
  const handleCharacterSelect = useCallback((character: any) => {
    console.log('🎭 选择角色:', character);
    setSelectedCharacter(character.name);
    
    // 选择角色后关闭AppMarket
    setAppMarketState(false, { updateUrl: false });
    
    return character;
  }, [setAppMarketState]);

  // 搜索处理
  const handleSearchChange = useCallback((value: string) => {
    console.log('🔍 搜索内容变化:', value);
    setSearchValue(value);
  }, []);

  // 清空搜索
  const handleSearchClear = useCallback(() => {
    console.log('🧹 清空搜索');
    setSearchValue('');
  }, []);

  // 重置所有状态
  const resetAppMarketState = useCallback(() => {
    console.log('🔄 重置 AppMarket 所有状态');
    setShowAppMarket(false);
    setSelectedCharacter(null);
    setSearchValue('');
  }, []);

  return {
    // 状态
    showAppMarket,
    selectedCharacter,
    searchValue,
    
    // 方法
    handleAppMarketOpen,
    handleAppMarketClose,
    handleAppMarketToggle,
    handleCharacterSelect,
    handleSearchChange,
    handleSearchClear,
    resetAppMarketState,
    setAppMarketState
  };
};

export default useAppMarketManager;