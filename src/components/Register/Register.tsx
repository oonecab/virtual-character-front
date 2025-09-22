import React, { useState } from 'react';
import { Form, Input, Button, Card, Toast } from '@douyinfe/semi-ui';
import { IconUser, IconLock, IconMail, IconPhone, IconIdCard } from '@douyinfe/semi-icons';
import { useRouter } from 'next/navigation';
import { request } from '../../utils/request';
import './Register.css';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  realName: string;
  phone: string;
  mail: string;
}

interface RegisterData {
  username: string;
  password: string;
  realName: string;
  phone: string;
  mail: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);
  const router = useRouter();

  const handleRegister = async (values: RegisterFormData) => {
    setLoading(true);
    try {
      // 检查用户名是否已存在
      const checkResponse = await request.get(`/users/check/${values.username}`);
      if (checkResponse.data) {
        Toast.error('用户名已存在，请选择其他用户名');
        setLoading(false);
        return;
      }

      const registerData: RegisterData = {
        username: values.username,
        password: values.password,
        realName: values.realName,
        phone: values.phone,
        mail: values.mail,
      };

      await request.post('/users/register', registerData);
      
      Toast.success('注册成功，请登录');
      
      // 跳转到登录页面
      router.push('/login');
    } catch (error: any) {
      console.error('注册失败:', error);
      Toast.error(error.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="register-container">
      <Card className="register-card" title="用户注册">
        <Form
          getFormApi={(formApi) => setFormApi(formApi)}
          onSubmit={handleRegister}
          style={{ width: '100%' }}
        >
          <Form.Input
            field="username"
            label="用户名"
            placeholder="用户名（3-20个字符）"
            prefix={<IconUser />}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="realName"
            label="真实姓名"
            placeholder="真实姓名"
            prefix={<IconIdCard />}
            rules={[
              { required: true, message: '请输入真实姓名' },
              { min: 2, max: 10, message: '真实姓名长度为2-10个字符' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="mail"
            label="邮箱地址"
            placeholder="邮箱地址"
            prefix={<IconMail />}
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="phone"
            label="手机号码"
            placeholder="手机号码"
            prefix={<IconPhone />}
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="password"
            label="密码"
            placeholder="密码（包含大小写字母和数字）"
            prefix={<IconLock />}
            mode="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
                message: '密码必须包含大小写字母和数字',
              },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Form.Input
            field="confirmPassword"
            label="确认密码"
            placeholder="确认密码"
            prefix={<IconLock />}
            mode="password"
            rules={[
              { required: true, message: '请确认密码' },
              {
                validator: (rule, value, callback) => {
                  if (formApi && value && formApi.getValue('password') !== value) {
                    callback('两次输入的密码不一致');
                  } else {
                    callback();
                  }
                },
              },
            ]}
            size="large"
            style={{ marginBottom: 16 }}
          />

          <Button
            theme="solid"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ marginBottom: 16 }}
          >
            注册
          </Button>

          <Button theme="borderless" onClick={handleLogin} block size="large">
            已有账号？立即登录
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Register;