import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { request } from '../../utils/request';
import './UserManagement.css';

const { Title } = Typography;
const { Option } = Select;

// 用户类型定义
interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  mail: string;
  delFlag: number;
  isAdmin: boolean;
  createTime: string;
  updateTime: string;
}

interface UserFormData {
  username: string;
  realName: string;
  phone: string;
  mail: string;
  delFlag: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取用户数据
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: searchText || undefined,
        status: selectedStatus === 'all' ? undefined : (selectedStatus === 'active' ? 0 : 1),
      };
      
      const response = await request.get('/users', { params });
      const { data: records, total } = response.data;
      
      setUsers(records);
      setPagination(prev => ({ ...prev, total }));
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 由于使用了服务端分页和过滤，这里不需要客户端过滤
  const filteredUsers = users;

  // 统计数据
  const stats = {
    total: users.length,
    active: users.filter(u => u.delFlag === 0).length,
    inactive: users.filter(u => u.delFlag === 1).length,
    admin: users.filter(u => u.isAdmin).length,
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      mail: user.mail,
      delFlag: user.delFlag,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    setLoading(true);
    try {
      // 注意：根据API文档，没有直接的删除用户接口
      // 这里可能需要调用修改用户状态的接口，将delFlag设为1
      // 或者联系后端添加删除用户的接口
      message.warning('删除功能暂未实现，请联系管理员');
      
      // 刷新用户列表
      await fetchUsers();
    } catch (error: any) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingUser) {
        // 编辑用户 - 调用更新用户接口
        await request.put(`/users/${editingUser.id}`, {
          realName: values.realName,
          phone: values.phone,
          mail: values.mail,
        });
        message.success('用户更新成功');
      } else {
        // 添加新用户 - 调用注册接口
        await request.post('/users/register', {
          username: values.username,
          password: values.password || '123456', // 默认密码
          realName: values.realName,
          phone: values.phone,
          mail: values.mail,
        });
        message.success('用户创建成功');
      }
      
      setIsModalVisible(false);
      // 刷新用户列表
      await fetchUsers();
    } catch (error: any) {
      console.error('保存用户失败:', error);
      message.error(error.message || '保存用户失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (delFlag: number) => {
    return delFlag === 0 ? 'green' : 'red';
  };

  const getStatusText = (delFlag: number) => {
    return delFlag === 0 ? '正常' : '禁用';
  };

  const handleSetAdmin = async (userId: number) => {
    try {
      await request.post('/users/admin', { userId });
      message.success('设置管理员成功');
      await fetchUsers();
    } catch (error: any) {
      console.error('设置管理员失败:', error);
      message.error('设置管理员失败');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.realName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record: User) => (
        <div>
          <div>{record.mail}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (
        <Tag color={isAdmin ? 'red' : 'blue'}>
          {isAdmin ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'delFlag',
      key: 'delFlag',
      render: (delFlag: number) => (
        <Tag color={getStatusColor(delFlag)}>
          {getStatusText(delFlag)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          {!record.isAdmin && (
            <Button
              type="link"
              onClick={() => handleSetAdmin(record.id)}
            >
              设为管理员
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div className="user-management-header">
        <Title level={2}>用户管理</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            添加用户
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="总用户" value={pagination.total} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="正常用户" value={stats.active} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="禁用用户" value={stats.inactive} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="管理员" value={stats.admin} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      {/* 搜索和过滤 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="搜索用户名、姓名或邮箱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: '100%' }}
              placeholder="选择角色"
              allowClear
            >
              <Option value="true">管理员</Option>
              <Option value="false">普通用户</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="选择状态"
              allowClear
            >
              <Option value="0">正常</Option>
              <Option value="1">禁用</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            delFlag: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mail"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="delFlag"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value={0}>正常</Option>
                  <Option value={1}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            {!editingUser && (
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' },
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;