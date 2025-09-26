'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spin } from 'antd';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  // 不需要认证的页面
  const publicRoutes = ['/login', '/register'];
  // 不使用管理布局的页面（包括聊天页面）
  const noLayoutRoutes = ['/login', '/register', '/character'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isNoLayoutRoute = noLayoutRoutes.includes(pathname);
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 公共路由不使用管理布局
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // 聊天页面等特殊页面不使用管理布局
  if (isNoLayoutRoute) {
    return <>{children}</>;
  }

  // 其他情况直接显示内容
  return <>{children}</>;
};

export default LayoutWrapper;