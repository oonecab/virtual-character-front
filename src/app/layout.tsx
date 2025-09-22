import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '../contexts/AuthContext';
import LayoutWrapper from '../components/LayoutWrapper/LayoutWrapper';
import "./globals.css";

export const metadata: Metadata = {
  title: "后台管理系统",
  description: "基于Next.js和Ant Design的后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <AuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
