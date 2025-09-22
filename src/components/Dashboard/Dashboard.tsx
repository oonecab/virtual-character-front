'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Typography,
  Space,
  Button,
  Alert,
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useCounter } from '@/hooks';
import './Dashboard.css';

const { Title, Text } = Typography;

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  growthRate: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // 使用自定义计数器Hook
  const { count: refreshCount, increment: incrementRefresh } = useCounter(0);

  // 模拟数据获取
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        totalUsers: 12543 + Math.floor(Math.random() * 100),
        totalOrders: 8765 + Math.floor(Math.random() * 50),
        totalRevenue: 234567 + Math.floor(Math.random() * 1000),
        growthRate: 12.5 + Math.random() * 5,
      });

      setRecentActivities([
        {
          id: '1',
          user: '张三',
          action: '创建了新订单',
          time: '2分钟前',
          status: 'success',
        },
        {
          id: '2',
          user: '李四',
          action: '更新了个人资料',
          time: '5分钟前',
          status: 'success',
        },
        {
          id: '3',
          user: '王五',
          action: '登录失败',
          time: '10分钟前',
          status: 'error',
        },
        {
          id: '4',
          user: '赵六',
          action: '上传了文件',
          time: '15分钟前',
          status: 'warning',
        },
      ]);

      setTopProducts([
        { id: '1', name: 'iPhone 15 Pro', sales: 1234, revenue: 1234567, growth: 15.2 },
        { id: '2', name: 'MacBook Air M2', sales: 856, revenue: 856000, growth: 8.7 },
        { id: '3', name: 'iPad Pro', sales: 642, revenue: 642000, growth: -2.1 },
        { id: '4', name: 'Apple Watch', sales: 523, revenue: 523000, growth: 12.3 },
      ]);
      
      setLoading(false);
    };

    fetchData();
  }, [refreshCount]);

  // 使用useMemo优化计算
  const totalProductRevenue = useMemo(() => {
    return topProducts.reduce((sum, product) => sum + product.revenue, 0);
  }, [topProducts]);

  const averageOrderValue = useMemo(() => {
    return dashboardData.totalOrders > 0 
      ? Math.round(dashboardData.totalRevenue / dashboardData.totalOrders)
      : 0;
  }, [dashboardData.totalRevenue, dashboardData.totalOrders]);

  const productColumns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => sales.toLocaleString(),
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `¥${revenue.toLocaleString()}`,
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={2}>仪表盘</Title>
        <Space>
          <Text type="secondary">刷新次数: {refreshCount}</Text>
          <Button type="primary" onClick={incrementRefresh} loading={loading}>
            刷新数据
          </Button>
        </Space>
      </div>

      <Alert
        message="欢迎使用后台管理系统"
        description="这是一个基于React和Ant Design构建的演示系统，展示了各种React Hook的使用方法。"
        type="info"
        showIcon
        closable
        style={{ marginBottom: 24 }}
      />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总用户数"
              value={dashboardData.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总订单数"
              value={dashboardData.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总收入"
              value={dashboardData.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="增长率"
              value={dashboardData.growthRate}
              precision={1}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 详细信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="平均订单价值" loading={loading}>
            <Statistic
              value={averageOrderValue}
              prefix="¥"
              valueStyle={{ fontSize: 24, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="产品总收入" loading={loading}>
            <Statistic
              value={totalProductRevenue}
              prefix="¥"
              valueStyle={{ fontSize: 24, color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热销产品表格 */}
        <Col xs={24} lg={14}>
          <Card title="热销产品" extra={<EyeOutlined />}>
            <Table
              columns={productColumns}
              dataSource={topProducts}
              loading={loading}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={10}>
          <Card title="最近活动" style={{ height: '100%' }}>
            <List
              loading={loading}
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.user}
                    description={
                      <Space>
                        <span>{item.action}</span>
                        <Tag color={item.status === 'success' ? 'green' : item.status === 'warning' ? 'orange' : 'red'}>
                          {item.status}
                        </Tag>
                      </Space>
                    }
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.time}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 进度指示器 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="月度目标完成度">
            <Progress percent={75} status="active" />
            <Text type="secondary">销售目标: 75%</Text>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用户增长">
            <Progress percent={60} strokeColor="#52c41a" />
            <Text type="secondary">用户增长: 60%</Text>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统性能">
            <Progress percent={90} strokeColor="#1890ff" />
            <Text type="secondary">系统性能: 90%</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;