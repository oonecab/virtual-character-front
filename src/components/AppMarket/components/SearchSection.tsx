import React from 'react';
import { Input } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

interface SearchSectionProps {
  searchValue: string;
  onSearch: (value: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchValue,
  onSearch
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '30px 40px',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Input
        placeholder="搜索 AI 角色..."
        value={searchValue}
        onChange={onSearch}
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
  );
};