import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Slider,
  Rate,
  Upload,
  Checkbox,
  Radio,
  Cascader,
  TreeSelect,
  AutoComplete,
  message,
  Steps,
  Typography,
  Divider,
  Space,
  Alert,
  Progress,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import './FormPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormData {
  // 基本信息
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  birthday: dayjs.Dayjs;
  
  // 地址信息
  country: string;
  province: string;
  city: string;
  address: string;
  
  // 偏好设置
  interests: string[];
  skills: string[];
  experience: number;
  salary: number;
  
  // 其他信息
  introduction: string;
  rating: number;
  newsletter: boolean;
  notifications: boolean;
  
  // 文件上传
  avatar?: any;
  resume?: any;
}

const FormPage: React.FC = () => {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<{ value: string }[]>([]);

  // 地区数据
  const regionData = [
    {
      value: 'china',
      label: '中国',
      children: [
        {
          value: 'beijing',
          label: '北京',
          children: [
            { value: 'chaoyang', label: '朝阳区' },
            { value: 'haidian', label: '海淀区' },
            { value: 'dongcheng', label: '东城区' },
          ],
        },
        {
          value: 'shanghai',
          label: '上海',
          children: [
            { value: 'huangpu', label: '黄浦区' },
            { value: 'xuhui', label: '徐汇区' },
            { value: 'changning', label: '长宁区' },
          ],
        },
        {
          value: 'guangdong',
          label: '广东',
          children: [
            { value: 'guangzhou', label: '广州市' },
            { value: 'shenzhen', label: '深圳市' },
            { value: 'dongguan', label: '东莞市' },
          ],
        },
      ],
    },
    {
      value: 'usa',
      label: '美国',
      children: [
        {
          value: 'california',
          label: '加利福尼亚',
          children: [
            { value: 'los-angeles', label: '洛杉矶' },
            { value: 'san-francisco', label: '旧金山' },
          ],
        },
      ],
    },
  ];

  // 技能树数据
  const skillTreeData = [
    {
      title: '前端开发',
      value: 'frontend',
      children: [
        { title: 'React', value: 'react' },
        { title: 'Vue', value: 'vue' },
        { title: 'Angular', value: 'angular' },
        { title: 'TypeScript', value: 'typescript' },
      ],
    },
    {
      title: '后端开发',
      value: 'backend',
      children: [
        { title: 'Node.js', value: 'nodejs' },
        { title: 'Python', value: 'python' },
        { title: 'Java', value: 'java' },
        { title: 'Go', value: 'go' },
      ],
    },
    {
      title: '数据库',
      value: 'database',
      children: [
        { title: 'MySQL', value: 'mysql' },
        { title: 'PostgreSQL', value: 'postgresql' },
        { title: 'MongoDB', value: 'mongodb' },
        { title: 'Redis', value: 'redis' },
      ],
    },
  ];

  // 监听表单变化，计算进度
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const totalFields = 15; // 总字段数
    let filledFields = 0;
    
    Object.values(values).forEach(value => {
      if (value !== undefined && value !== null && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        filledFields++;
      }
    });
    
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  };

  // 自动完成搜索
  const handleEmailSearch = (value: string) => {
    const domains = ['@gmail.com', '@qq.com', '@163.com', '@outlook.com', '@hotmail.com'];
    const options = domains.map(domain => ({ value: value + domain }));
    setAutoCompleteOptions(options);
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload', // 模拟上传地址
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return false; // 阻止自动上传，仅用于演示
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  // 提交表单
  const handleSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('表单数据:', values);
      message.success('表单提交成功！');
      
      // 重置表单
      form.resetFields();
      setCurrentStep(0);
      setFormProgress(0);
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setFormProgress(0);
    message.info('表单已重置');
  };

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      description: '填写个人基本信息',
    },
    {
      title: '联系方式',
      description: '填写联系地址',
    },
    {
      title: '技能偏好',
      description: '选择技能和偏好',
    },
    {
      title: '完成',
      description: '确认并提交',
    },
  ];

  // 渲染不同步骤的表单内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[
                    { required: true, message: '请输入姓名' },
                    { min: 2, message: '姓名至少2个字符' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="性别"
                  rules={[{ required: true, message: '请选择性别' }]}
                >
                  <Radio.Group>
                    <Radio value="male">男</Radio>
                    <Radio value="female">女</Radio>
                    <Radio value="other">其他</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <AutoComplete
                    options={autoCompleteOptions}
                    onSearch={handleEmailSearch}
                    placeholder="请输入邮箱"
                  >
                    <Input prefix={<MailOutlined />} />
                  </AutoComplete>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="birthday"
              label="生日"
              rules={[{ required: true, message: '请选择生日' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择生日"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </>
        );
        
      case 1:
        return (
          <>
            <Form.Item
              name="region"
              label="地区"
              rules={[{ required: true, message: '请选择地区' }]}
            >
              <Cascader
                options={regionData}
                placeholder="请选择国家/省份/城市"
                showSearch
              />
            </Form.Item>
            
            <Form.Item
              name="address"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入详细地址"
              />
            </Form.Item>
          </>
        );
        
      case 2:
        return (
          <>
            <Form.Item
              name="skills"
              label="技能"
              rules={[{ required: true, message: '请选择技能' }]}
            >
              <TreeSelect
                treeData={skillTreeData}
                placeholder="请选择技能"
                multiple
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="interests"
              label="兴趣爱好"
            >
              <Checkbox.Group>
                <Row>
                  <Col span={6}><Checkbox value="reading">阅读</Checkbox></Col>
                  <Col span={6}><Checkbox value="music">音乐</Checkbox></Col>
                  <Col span={6}><Checkbox value="sports">运动</Checkbox></Col>
                  <Col span={6}><Checkbox value="travel">旅行</Checkbox></Col>
                  <Col span={6}><Checkbox value="photography">摄影</Checkbox></Col>
                  <Col span={6}><Checkbox value="cooking">烹饪</Checkbox></Col>
                  <Col span={6}><Checkbox value="gaming">游戏</Checkbox></Col>
                  <Col span={6}><Checkbox value="art">艺术</Checkbox></Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="experience"
                  label="工作经验（年）"
                >
                  <Slider
                    min={0}
                    max={20}
                    marks={{
                      0: '0年',
                      5: '5年',
                      10: '10年',
                      15: '15年',
                      20: '20年+',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="salary"
                  label="期望薪资（万/年）"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={200}
                    step={5}
                    formatter={(value) => `${value}万`}
                    parser={(value) => value!.replace('万', '')}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="rating"
              label="自我评价"
            >
              <Rate allowHalf />
            </Form.Item>
            
            <Form.Item
              name="introduction"
              label="个人介绍"
            >
              <TextArea
                rows={4}
                placeholder="请简单介绍一下自己"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </>
        );
        
      case 3:
        return (
          <>
            <Form.Item
              name="avatar"
              label="头像上传"
            >
              <Upload {...uploadProps} listType="picture-card">
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              </Upload>
            </Form.Item>
            
            <Form.Item
              name="resume"
              label="简历上传"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>点击上传简历</Button>
              </Upload>
            </Form.Item>
            
            <Divider />
            
            <Form.Item
              name="newsletter"
              label="订阅通知"
              valuePropName="checked"
            >
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
            
            <Form.Item
              name="notifications"
              label="推送通知"
              valuePropName="checked"
            >
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
            
            <Alert
              message="提交前请确认"
              description="请仔细检查所填写的信息，确认无误后点击提交按钮。"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="form-page">
      <div className="form-page-header">
        <Title level={2}>表单页面</Title>
        <Text type="secondary">展示各种表单控件和验证功能</Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card>
            {/* 进度条 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>表单完成度</Text>
                <Text>{formProgress}%</Text>
              </div>
              <Progress percent={formProgress} strokeColor="#52c41a" />
            </div>

            {/* 步骤条 */}
            <Steps 
              current={currentStep} 
              style={{ marginBottom: 32 }}
              items={steps.map((step, index) => ({
                key: index,
                title: step.title,
                description: step.description,
                icon: index === steps.length - 1 ? <CheckCircleOutlined /> : undefined
              }))}
            />

            {/* 表单内容 */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleFormChange}
              initialValues={{
                gender: 'male',
                newsletter: true,
                notifications: false,
                rating: 3,
                experience: 2,
                salary: 10,
              }}
            >
              {renderStepContent()}

              {/* 操作按钮 */}
              <div className="form-actions">
                <Space>
                  {currentStep > 0 && (
                    <Button onClick={() => setCurrentStep(currentStep - 1)}>
                      上一步
                    </Button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        form.validateFields().then(() => {
                          setCurrentStep(currentStep + 1);
                        }).catch(() => {
                          message.error('请完善当前步骤的信息');
                        });
                      }}
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      提交表单
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleReset}
                    icon={<ReloadOutlined />}
                  >
                    重置表单
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={6}>
          <Card title="表单说明" size="small">
            <Paragraph>
              <Text strong>当前步骤：</Text>{steps[currentStep]?.title}
            </Paragraph>
            <Paragraph>
              <Text type="secondary">
                {steps[currentStep]?.description}
              </Text>
            </Paragraph>
            
            <Divider />
            
            <Paragraph>
              <Text strong>功能特性：</Text>
            </Paragraph>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>分步骤表单</li>
              <li>实时表单验证</li>
              <li>进度条显示</li>
              <li>文件上传</li>
              <li>自动完成</li>
              <li>级联选择</li>
              <li>树形选择</li>
              <li>滑块控件</li>
              <li>评分组件</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FormPage;