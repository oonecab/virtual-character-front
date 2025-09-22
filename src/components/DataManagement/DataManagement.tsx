import React, { useState, useEffect, useReducer, useMemo } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Upload,
  Drawer,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import './DataManagement.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DataRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface DataState {
  records: DataRecord[];
  loading: boolean;
  selectedRowKeys: string[];
  filters: {
    category: string;
    status: string;
    priceRange: [number, number] | null;
    dateRange: [string, string] | null;
  };
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECORDS'; payload: DataRecord[] }
  | { type: 'ADD_RECORD'; payload: DataRecord }
  | { type: 'UPDATE_RECORD'; payload: { id: string; data: Partial<DataRecord> } }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'DELETE_MULTIPLE'; payload: string[] }
  | { type: 'SET_SELECTED_ROWS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<DataState['filters']> };

const initialState: DataState = {
  records: [],
  loading: false,
  selectedRowKeys: [],
  filters: {
    category: 'all',
    status: 'all',
    priceRange: null,
    dateRange: null,
  },
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'ADD_RECORD':
      return { ...state, records: [action.payload, ...state.records] };
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map(record =>
          record.id === action.payload.id
            ? { ...record, ...action.payload.data, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
            : record
        ),
      };
    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(record => record.id !== action.payload),
      };
    case 'DELETE_MULTIPLE':
      return {
        ...state,
        records: state.records.filter(record => !action.payload.includes(record.id)),
        selectedRowKeys: [],
      };
    case 'SET_SELECTED_ROWS':
      return { ...state, selectedRowKeys: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

const DataManagement: React.FC = () => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<DataRecord | null>(null);
  const [form] = Form.useForm();

  // 模拟数据生成
  const generateMockData = (): DataRecord[] => {
    const categories = ['电子产品', '服装', '食品', '图书', '家居', '运动'];
    const statuses: DataRecord['status'][] = ['active', 'inactive', 'discontinued'];
    const products = [
      'iPhone 15', 'MacBook Pro', '运动鞋', '连衣裙', '咖啡豆', '小说集',
      '沙发', '跑步机', 'iPad', '耳机', 'T恤', '牛仔裤', '茶叶', '台灯'
    ];

    return Array.from({ length: 100 }, (_, index) => ({
      id: `record-${index + 1}`,
      name: products[index % products.length] + ` ${Math.floor(index / products.length) + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Math.floor(Math.random() * 10000) + 100,
      stock: Math.floor(Math.random() * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: dayjs().subtract(Math.floor(Math.random() * 365), 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
      description: `这是${products[index % products.length]}的详细描述信息。`,
    }));
  };

  // 获取数据
  const fetchData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockData = generateMockData();
    dispatch({ type: 'SET_RECORDS', payload: mockData });
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 过滤数据
  const filteredData = useMemo(() => {
    return state.records.filter(record => {
      const matchesSearch = record.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           record.category.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = state.filters.category === 'all' || record.category === state.filters.category;
      const matchesStatus = state.filters.status === 'all' || record.status === state.filters.status;
      
      let matchesPrice = true;
      if (state.filters.priceRange) {
        const [min, max] = state.filters.priceRange;
        matchesPrice = record.price >= min && record.price <= max;
      }
      
      let matchesDate = true;
      if (state.filters.dateRange) {
        const [start, end] = state.filters.dateRange;
        const recordDate = dayjs(record.createdAt);
        matchesDate = recordDate.isAfter(dayjs(start)) && recordDate.isBefore(dayjs(end));
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesDate;
    });
  }, [state.records, searchText, state.filters]);

  // 统计数据
  const stats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, record) => sum + (record.price * record.stock), 0);
    const avgPrice = filteredData.length > 0 ? filteredData.reduce((sum, record) => sum + record.price, 0) / filteredData.length : 0;
    
    return {
      total: filteredData.length,
      totalValue,
      avgPrice,
      lowStock: filteredData.filter(record => record.stock < 50).length,
    };
  }, [filteredData]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: DataRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      createdAt: dayjs(record.createdAt),
    });
    setIsModalVisible(true);
  };

  const handleView = (record: DataRecord) => {
    setViewingRecord(record);
    setIsDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'DELETE_RECORD', payload: id });
    message.success('删除成功');
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const handleBatchDelete = async () => {
    if (state.selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    dispatch({ type: 'DELETE_MULTIPLE', payload: state.selectedRowKeys });
    message.success(`成功删除 ${state.selectedRowKeys.length} 条记录`);
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (editingRecord) {
        dispatch({
          type: 'UPDATE_RECORD',
          payload: {
            id: editingRecord.id,
            data: {
              ...values,
              createdAt: values.createdAt.format('YYYY-MM-DD HH:mm:ss'),
            },
          },
        });
        message.success('更新成功');
      } else {
        const newRecord: DataRecord = {
          id: `record-${Date.now()}`,
          ...values,
          createdAt: values.createdAt.format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        dispatch({ type: 'ADD_RECORD', payload: newRecord });
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getStatusColor = (status: DataRecord['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'discontinued': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: DataRecord['status']) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '非活跃';
      case 'discontinued': return '已停产';
      default: return status;
    }
  };

  const columns: ColumnsType<DataRecord> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Text strong style={{ color: '#1890ff' }}>{name}</Text>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: '电子产品', value: '电子产品' },
        { text: '服装', value: '服装' },
        { text: '食品', value: '食品' },
        { text: '图书', value: '图书' },
        { text: '家居', value: '家居' },
        { text: '运动', value: '运动' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number) => (
        <span style={{ color: stock < 50 ? '#ff4d4f' : '#52c41a' }}>
          {stock.toLocaleString()}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: DataRecord['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '非活跃', value: 'inactive' },
        { text: '已停产', value: 'discontinued' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: DataRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
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

  const rowSelection = {
    selectedRowKeys: state.selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      dispatch({ type: 'SET_SELECTED_ROWS', payload: selectedRowKeys as string[] });
    },
  };

  return (
    <div className="data-management">
      <div className="data-management-header">
        <Title level={2}>数据管理</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={state.loading}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="总记录数" value={stats.total} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="总价值" 
              value={stats.totalValue} 
              prefix="¥" 
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="平均价格" 
              value={stats.avgPrice} 
              prefix="¥" 
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="低库存" value={stats.lowStock} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      {/* 搜索和过滤 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="搜索产品名称或分类"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={state.filters.category}
              onChange={(value) => dispatch({ type: 'SET_FILTERS', payload: { category: value } })}
              style={{ width: '100%' }}
              placeholder="选择分类"
            >
              <Option value="all">所有分类</Option>
              <Option value="电子产品">电子产品</Option>
              <Option value="服装">服装</Option>
              <Option value="食品">食品</Option>
              <Option value="图书">图书</Option>
              <Option value="家居">家居</Option>
              <Option value="运动">运动</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={state.filters.status}
              onChange={(value) => dispatch({ type: 'SET_FILTERS', payload: { status: value } })}
              style={{ width: '100%' }}
              placeholder="选择状态"
            >
              <Option value="all">所有状态</Option>
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="discontinued">已停产</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates) {
                  dispatch({
                    type: 'SET_FILTERS',
                    payload: {
                      dateRange: [dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')],
                    },
                  });
                } else {
                  dispatch({ type: 'SET_FILTERS', payload: { dateRange: null } });
                }
              }}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                dispatch({
                  type: 'SET_FILTERS',
                  payload: { category: 'all', status: 'all', priceRange: null, dateRange: null },
                });
                setSearchText('');
              }}
            >
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 批量操作 */}
      {state.selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space>
            <Text>已选择 {state.selectedRowKeys.length} 项</Text>
            <Popconfirm
              title={`确定要删除选中的 ${state.selectedRowKeys.length} 条记录吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
            <Button
              onClick={() => dispatch({ type: 'SET_SELECTED_ROWS', payload: [] })}
            >
              取消选择
            </Button>
          </Space>
        </Card>
      )}

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={state.loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑记录' : '添加记录'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={state.loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            createdAt: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Option value="电子产品">电子产品</Option>
                  <Option value="服装">服装</Option>
                  <Option value="食品">食品</Option>
                  <Option value="图书">图书</Option>
                  <Option value="家居">家居</Option>
                  <Option value="运动">运动</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入价格"
                  min={0}
                  precision={2}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="库存"
                rules={[{ required: true, message: '请输入库存' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入库存"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">非活跃</Option>
                  <Option value="discontinued">已停产</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="createdAt"
            label="创建时间"
            rules={[{ required: true, message: '请选择创建时间' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入产品描述"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="记录详情"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={400}
      >
        {viewingRecord && (
          <div className="record-detail">
            <div className="detail-item">
              <Text strong>产品名称：</Text>
              <Text>{viewingRecord.name}</Text>
            </div>
            <div className="detail-item">
              <Text strong>分类：</Text>
              <Text>{viewingRecord.category}</Text>
            </div>
            <div className="detail-item">
              <Text strong>价格：</Text>
              <Text>¥{viewingRecord.price.toLocaleString()}</Text>
            </div>
            <div className="detail-item">
              <Text strong>库存：</Text>
              <Text>{viewingRecord.stock.toLocaleString()}</Text>
            </div>
            <div className="detail-item">
              <Text strong>状态：</Text>
              <Tag color={getStatusColor(viewingRecord.status)}>
                {getStatusText(viewingRecord.status)}
              </Tag>
            </div>
            <div className="detail-item">
              <Text strong>创建时间：</Text>
              <Text>{viewingRecord.createdAt}</Text>
            </div>
            <div className="detail-item">
              <Text strong>更新时间：</Text>
              <Text>{viewingRecord.updatedAt}</Text>
            </div>
            {viewingRecord.description && (
              <div className="detail-item">
                <Text strong>描述：</Text>
                <Text>{viewingRecord.description}</Text>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DataManagement;