// AppMarket 相关类型定义
export interface AppMarketProps {
  visible: boolean;
  onClose?: () => void;
  onSelectCharacter?: (character: any) => void;
}

export interface AppMarketState {
  searchValue: string;
  isAnimating: boolean;
  shouldRender: boolean;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

export interface CharacterCardProps {
  character: any;
  index: number;
  isAnimating: boolean;
  onSelect: (character: any) => void;
}