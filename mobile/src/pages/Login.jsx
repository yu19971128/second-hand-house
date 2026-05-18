import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast, Tabs, NavBar } from 'antd-mobile';
import request from '../utils/request';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await request.post('/auth/login', values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      Toast.show({ content: '登录成功', icon: 'success' });
      navigate(-1);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      Toast.show({ content: '两次密码不一致', icon: 'fail' });
      return;
    }
    setLoading(true);
    try {
      const res = await request.post('/auth/register', {
        username: values.username,
        password: values.password,
        phone: values.phone,
        role: values.role || 'buyer',
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      Toast.show({ content: '注册成功', icon: 'success' });
      navigate('/');
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>账户</NavBar>

      <div style={{ background: '#1677ff', padding: '32px 24px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>🏠 二手房</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>找到你理想的家</div>
      </div>

      <div style={{ background: '#fff', margin: '0 0 8px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.Tab title="登录" key="login">
            <div style={{ padding: '16px 16px 24px' }}>
              <Form
                form={loginForm}
                onFinish={handleLogin}
                layout="vertical"
                footer={
                  <Button block color="primary" type="submit" loading={loading} size="large">
                    登录
                  </Button>
                }
              >
                <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input type="password" placeholder="请输入密码" />
                </Form.Item>
              </Form>
            </div>
          </Tabs.Tab>

          <Tabs.Tab title="注册" key="register">
            <div style={{ padding: '16px 16px 24px' }}>
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
                footer={
                  <Button block color="primary" type="submit" loading={loading} size="large">
                    注册
                  </Button>
                }
              >
                <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="2-20个字符" />
                </Form.Item>
                <Form.Item name="phone" label="手机号">
                  <Input placeholder="选填" type="tel" />
                </Form.Item>
                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码不少于6位' }]}>
                  <Input type="password" placeholder="至少6位" />
                </Form.Item>
                <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
                  <Input type="password" placeholder="再次输入密码" />
                </Form.Item>
              </Form>
            </div>
          </Tabs.Tab>
        </Tabs>
      </div>

      <div style={{ padding: '0 16px', fontSize: 12, color: '#999', textAlign: 'center' }}>
        测试账号：admin / admin123
      </div>
    </div>
  );
}
