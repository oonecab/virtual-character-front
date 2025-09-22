import React, { useState } from 'react';
import { Form, Input, Button, Card, Toast, Checkbox } from '@douyinfe/semi-ui';
import { IconUser, IconLock } from '@douyinfe/semi-icons';
import { useRouter } from 'next/navigation';
import { request } from '../../utils/request';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

interface LoginData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const loginData: LoginData = {
        username: values.username,
        password: values.password,
      };

      const response = await request.post('/users/login', loginData);
      
      // 假设登录成功后返回的数据中包含token和用户信息
      const { data } = response;
      
      if (data.token) {
        // 使用认证上下文存储token和用户信息
        const userInfo = {
          id: data.userInfo?.id || 0,
          username: values.username,
          realName: data.userInfo?.realName || values.username,
          mail: data.userInfo?.mail || '',
          phone: data.userInfo?.phone || '',
          isAdmin: data.userInfo?.isAdmin || false,
        };
        login(data.token, userInfo);
        
        Toast.success('登录成功');
        
        // 跳转到首页或之前访问的页面
        router.push('/ai-characters');
      } else {
        Toast.error('登录失败：未获取到有效token');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      Toast.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="用户登录">
        <Form
          getFormApi={(formApi) => setFormApi(formApi)}
          onSubmit={handleLogin}
          style={{ width: '100%' }}
        >
          <Form.Input
            field="username"
            label="用户名"
            placeholder="用户名"
            prefix={<IconUser />}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="password"
            label="密码"
            placeholder="密码"
            prefix={<IconLock />}
            mode="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Checkbox field="remember" style={{ marginBottom: 16 }}>
            记住我
          </Form.Checkbox>

          <Button
            theme="solid"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ marginBottom: 16 }}
          >
            登录
          </Button>

          <Button theme="borderless" onClick={handleRegister} block size="large">
            还没有账号？立即注册
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;