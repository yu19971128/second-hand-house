import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Form, Input, Button, Toast } from 'antd-mobile';
import request from '../utils/request';

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [profileForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  // 保存基本信息
  const handleSaveProfile = async (values) => {
    setProfileLoading(true);
    try {
      const res = await request.post('/auth/edit', {
        username: values.username,
        phone: values.phone,
      });
      // 更新本地缓存
      const newUser = { ...user, username: res.data.username, phone: res.data.phone };
      localStorage.setItem('user', JSON.stringify(newUser));
      Toast.show({ content: '个人信息已更新', icon: 'success' });
      navigate('/my');
    } catch (e) {
      console.error(e);
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar onBack={() => navigate('/my')} style={{ background: '#fff' }}>
        编辑个人信息
      </NavBar>

      {/* 头像区域 */}
      <div style={{
        background: '#1677ff',
        padding: '28px 0 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          border: '3px solid rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 30,
          fontWeight: 'bold',
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
          {user?.role === 'agent' ? '中介经纪人' : user?.role === 'admin' ? '管理员' : '普通用户'}
        </div>
      </div>

      {/* 基本信息表单 */}
      <div style={{ marginTop: -24, borderRadius: '20px 20px 0 0', background: '#f5f5f5', paddingTop: 12 }}>

        <div style={{ margin: '0 12px 12px', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
            基本信息
          </div>
          <Form
            form={profileForm}
            initialValues={{ username: user?.username, phone: user?.phone || '' }}
            onFinish={handleSaveProfile}
            footer={
              <Button
                block
                color="primary"
                type="submit"
                loading={profileLoading}
                style={{ borderRadius: 8 }}
              >
                保存基本信息
              </Button>
            }
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '用户名不能为空' },
                { min: 2, max: 20, message: '用户名长度为 2-20 位' },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input type="tel" placeholder="请输入手机号（选填）" />
            </Form.Item>
          </Form>
        </div>

        {/* 修改密码表单 */}
      

      </div>
    </div>
  );
}
