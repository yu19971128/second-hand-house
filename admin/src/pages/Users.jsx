import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Select, Button, Tag, Space, message, Popconfirm, Typography, Row, Col, Avatar } from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title } = Typography;
const { Option } = Select;

const ROLE_MAP = {
  buyer: { text: '买家', color: 'blue' },
  agent: { text: '中介', color: 'orange' },
  admin: { text: '管理员', color: 'red' },
};

export default function Users() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '', role: '', status: '' });

  const fetchUsers = useCallback(async (p = params) => {
    setLoading(true);
    try {
      const res = await request.get('/admin/users', { params: p });
      setList(res.data.list);
      setTotal(res.data.total);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line

  const handleSearch = () => {
    const newParams = { ...params, page: 1 };
    setParams(newParams);
    fetchUsers(newParams);
  };

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'active' ? 'disabled' : 'active';
    try {
      await request.put(`/admin/users/${record.id}/status`, { status: newStatus });
      message.success(newStatus === 'active' ? '用户已启用' : '用户已禁用');
      fetchUsers();
    } catch (e) {
      message.error(e.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '用户',
      dataIndex: 'username',
      render: (name) => (
        <Space>
          <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
          {name}
        </Space>
      ),
    },
    { title: '手机号', dataIndex: 'phone', width: 130, render: (v) => v || '-' },
    {
      title: '角色',
      dataIndex: 'role',
      width: 90,
      render: (r) => <Tag color={ROLE_MAP[r]?.color}>{ROLE_MAP[r]?.text || r}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s) => <Tag color={s === 'active' ? 'success' : 'error'}>{s === 'active' ? '正常' : '已禁用'}</Tag>,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      width: 170,
      render: (v) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title={`确定${record.status === 'active' ? '禁用' : '启用'}该用户吗？`}
          onConfirm={() => handleToggleStatus(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            size="small"
            type={record.status === 'active' ? 'default' : 'primary'}
            danger={record.status === 'active'}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>用户管理</Title>

      <Card bordered={false} style={{ borderRadius: 10, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="搜索用户名/手机号"
              prefix={<SearchOutlined />}
              value={params.keyword}
              onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="用户角色"
              style={{ width: 110 }}
              value={params.role || undefined}
              onChange={(v) => setParams(prev => ({ ...prev, role: v || '' }))}
              allowClear
            >
              <Option value="buyer">买家</Option>
              <Option value="agent">中介</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="账号状态"
              style={{ width: 110 }}
              value={params.status || undefined}
              onChange={(v) => setParams(prev => ({ ...prev, status: v || '' }))}
              allowClear
            >
              <Option value="active">正常</Option>
              <Option value="disabled">已禁用</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button icon={<ReloadOutlined />} onClick={() => {
                const reset = { page: 1, pageSize: 10, keyword: '', role: '', status: '' };
                setParams(reset);
                fetchUsers(reset);
              }}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 10 }}>
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => {
              const newParams = { ...params, page, pageSize };
              setParams(newParams);
              fetchUsers(newParams);
            },
          }}
        />
      </Card>
    </div>
  );
}
