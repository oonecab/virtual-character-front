'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    IconUser,
    IconVideo,
    IconUpload,
    IconHome,
    IconSetting,
    IconExit,
    IconBolt, 
    IconRoute,
    IconChevronLeft,
    IconChevronRight,
    IconSemiLogo,
    IconBell,
    IconHelpCircle,
} from '@douyinfe/semi-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Layout, Nav, Avatar, Dropdown, Space, Breadcrumb } from '@douyinfe/semi-ui';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['ai-characters']);
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentPath = pathname.split('/')[1] || 'ai-characters';
    setSelectedKeys([currentPath]);
  }, [pathname]);

  const userMenuItems = [
    {
      node: 'item',
      name: '个人资料',
      onClick: () => router.push('/profile'),
    },
    {
      node: 'item', 
      name: '账户设置',
      onClick: () => router.push('/account-settings'),
    },
    {
      node: 'divider',
    },
    {
      node: 'item',
      name: '退出登录',
      onClick: logout,
    },
  ];

  const handleNavClick = (itemKey: string) => {
    if (itemKey === 'ai-characters') {
      router.push('/ai-characters');
    } else {
      router.push(`/${itemKey}`);
    }
  };

  return (
    <Layout className="admin-layout" style={{ border: '1px solid var(--semi-color-border)' }}>
      <Header style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <Nav mode="horizontal" selectedKeys={selectedKeys}>
          <Nav.Header>
            <IconSemiLogo style={{ height: '36px', fontSize: 36 }} />
          </Nav.Header>
          <Nav.Item 
            itemKey="ai-characters" 
            text="AI 角色扮演" 
            icon={<IconRoute />}
            onClick={() => handleNavClick('ai-characters')}
          />
          <Nav.Item 
            itemKey="dashboard" 
            text="仪表盘" 
            icon={<IconHome />}
            onClick={() => handleNavClick('dashboard')}
          />
          <Nav.Item 
            itemKey="settings" 
            text="设置" 
            icon={<IconSetting />}
            onClick={() => handleNavClick('settings')}
          />
          <Nav.Footer>
            <Button
              theme="borderless"
              icon={<IconBell size="large" />}
              style={{
                color: 'var(--semi-color-text-2)',
                marginRight: '12px',
              }}
            />
            <Button
              theme="borderless"
              icon={<IconHelpCircle size="large" />}
              style={{
                color: 'var(--semi-color-text-2)',
                marginRight: '12px',
              }}
            />
            <Dropdown menu={userMenuItems} position="bottomRight">
              <Avatar color="orange" size="small" style={{ cursor: 'pointer' }}>
                {user?.realName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </Dropdown>
          </Nav.Footer>
        </Nav>
      </Header>
      <Content
        style={{
          padding: '24px',
          backgroundColor: 'var(--semi-color-bg-0)',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Breadcrumb
          style={{
            marginBottom: '24px',
          }}
          routes={['首页', '当前页面']}
        />
        <div
          style={{
            borderRadius: '10px',
            border: '1px solid var(--semi-color-border)',
            minHeight: '376px',
            padding: '32px',
            backgroundColor: '#fff',
          }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLayout;
export type { AdminLayoutProps };