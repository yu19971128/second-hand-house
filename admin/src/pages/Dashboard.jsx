import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, message } from 'antd';
import { HomeOutlined, UserOutlined, HeartOutlined } from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import request from '../utils/request';

const { Title } = Typography;
const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await request.get('/admin/stats');
        setStats(res.data);
      } catch (e) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#999' }}>数据加载中...</div>
      </div>
    );
  }

  const { overview, dailyHouses, dailyUsers, regionDist, typeDist } = stats || {};

  const statCards = [
    { title: '在售房源', value: overview?.activeHouseCount, icon: <HomeOutlined />, color: '#1677ff' },
    { title: '总房源数', value: overview?.houseCount, icon: <HomeOutlined />, color: '#52c41a' },
    { title: '注册用户', value: overview?.userCount, icon: <UserOutlined />, color: '#faad14' },
    { title: '总收藏', value: overview?.favoriteCount, icon: <HeartOutlined />, color: '#f5222d' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>数据概览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((item, i) => (
          <Col xs={12} sm={12} md={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: item.color }}>
                  {item.icon}
                </div>
                <Statistic title={item.title} value={item.value ?? '-'} valueStyle={{ color: item.color, fontSize: 24 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={14}>
          <Card title="近7天新增趋势" bordered={false} style={{ borderRadius: 10 }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" allowDuplicatedCategory={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line data={dailyHouses} type="monotone" dataKey="count" stroke="#1677ff" name="新增房源" dot={false} />
                <Line data={dailyUsers} type="monotone" dataKey="count" stroke="#52c41a" name="新增用户" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="户型分布" bordered={false} style={{ borderRadius: 10 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typeDist} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                  {(typeDist || []).map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Card title="地区房源分布" bordered={false} style={{ borderRadius: 10 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={regionDist || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#1677ff" name="在售数量" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
