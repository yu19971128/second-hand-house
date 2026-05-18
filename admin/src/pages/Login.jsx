import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import request from '../utils/request';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await request.post('/auth/login', values);
      if (res.data.user.role !== 'admin') {
        message.error('无管理员权限，请使用管理员账号登录');
        return;
      }
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      message.success('登录成功');
      navigate('/dashboard');
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1677ff 0%, #0050b3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Card
        style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        bodyStyle={{ padding: '40px 40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>二手房管理系统</h2>
          <p style={{ color: '#999', fontSize: 14 }}>Admin Dashboard</p>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#bbb' }} />}
              placeholder="管理员账号"
              size="large"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#bbb' }}>
          测试账号：admin / admin123
        </div>
      </Card>
    </div>
  );
}
