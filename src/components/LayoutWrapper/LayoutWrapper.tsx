'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../AdminLayout/AdminLayout';
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
  const noLayoutRoutes = ['/login', '/register', '/ai-characters'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isNoLayoutRoute = noLayoutRoutes.includes(pathname);

  // 移除强制重定向逻辑，允许用户自由访问所有页面
  // useEffect(() => {
  //   // 如果用户未认证且不在公共路由，重定向到登录页
  //   if (!loading && !isAuthenticated && !isPublicRoute) {
  //     window.location.href = '/login';
  //   }
  //   // 如果用户已认证且在登录/注册页，重定向到首页
  //   if (!loading && isAuthenticated && isPublicRoute) {
  //     window.location.href = '/';
  //   }
  // }, [isAuthenticated, loading, isPublicRoute]);

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

  // 所有页面都可以自由访问
  // 如果用户已认证且不在公共路由，使用管理布局
  if (isAuthenticated && !isPublicRoute && !isNoLayoutRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // 其他情况直接显示内容
  return <>{children}</>;
};

export default LayoutWrapper;