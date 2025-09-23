import React, { useState } from 'react';
import { Form, Input, Button, Card, Checkbox, Notification } from '@douyinfe/semi-ui';
import { IconUser, IconLock } from '@douyinfe/semi-icons';
import { useRouter } from 'next/navigation';
import { UserManagementService, UserLoginReqDTO } from '../../services/userManagement';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const loginData: UserLoginReqDTO = {
        username: values.username,
        password: values.password,
      };

      const response = await UserManagementService.login(loginData);
      
      // 根据新的响应结构处理数据
      if (response && response.data && response.data.token) {
        const userInfo = response.data;
        
        // 使用认证上下文存储用户信息
        const authUserInfo = {
          id: userInfo.id,
          username: userInfo.username,
          realName: userInfo.realName || userInfo.username,
          mail: userInfo.mail || '',
          phone: userInfo.phone || '',
          isAdmin: userInfo.isAdmin || false,
        };
        
        // 使用后端返回的真实token
        const token = userInfo.token;
        login(token, authUserInfo);
        
        Notification.success({ 
          title: '登录成功', 
          content: '欢迎回来！',
          position: 'top'
        });
        
        // 跳转到首页或之前访问的页面
        router.push('/ai-characters');
      } else {
        Notification.error({ 
          title: '登录失败', 
          content: '登录失败：服务器响应异常',
          position: 'top'
        });
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      Notification.error({ 
        title: '登录失败', 
        content: error.message || '登录失败，请检查用户名和密码',
        position: 'top'
      });
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