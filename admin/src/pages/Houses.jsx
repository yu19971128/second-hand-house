import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Select, Button, Tag, Space, message, Popconfirm, Typography, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title } = Typography;
const { Option } = Select;

const STATUS_MAP = {
  active: { text: '在售', color: 'success' },
  offline: { text: '已下架', color: 'error' },
  pending: { text: '待审核', color: 'warning' },
};

export default function Houses() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '', status: '' });

  const fetchHouses = useCallback(async (p = params) => {
    setLoading(true);
    try {
      const res = await request.get('/admin/houses', { params: p });
      setList(res.data.list);
      setTotal(res.data.total);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchHouses();
  }, []); // eslint-disable-line

  const handleSearch = () => {
    const newParams = { ...params, page: 1 };
    setParams(newParams);
    fetchHouses(newParams);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await request.put(`/admin/houses/${id}/status`, { status });
      message.success('操作成功');
      fetchHouses();
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/admin/houses/${id}`);
      message.success('删除成功');
      fetchHouses();
    } catch (e) {
      message.error(e.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (text) => <span title={text}>{text}</span>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v) => <span style={{ color: '#f40', fontWeight: 'bold' }}>{v} 万</span>,
    },
    { title: '地区', dataIndex: 'region', width: 90 },
    { title: '户型', dataIndex: 'type', width: 90 },
    { title: '面积', dataIndex: 'area', width: 80, render: (v) => `${v}㎡` },
    { title: '发布者', dataIndex: 'publisher', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.text || s}</Tag>,
    },
    { title: '浏览', dataIndex: 'view_count', width: 70 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          {record.status === 'active' ? (
            <Button size="small" danger onClick={() => handleStatusChange(record.id, 'offline')}>下架</Button>
          ) : (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'active')}>上架</Button>
          )}
          <Popconfirm title="确定删除该房源吗？" onConfirm={() => handleDelete(record.id)} okText="删除" cancelText="取消">
            <Button size="small" danger type="text">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>房源管理</Title>

      <Card bordered={false} style={{ borderRadius: 10, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="搜索标题/地址"
              prefix={<SearchOutlined />}
              value={params.keyword}
              onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="房源状态"
              style={{ width: 120 }}
              value={params.status || undefined}
              onChange={(v) => setParams(prev => ({ ...prev, status: v || '' }))}
              allowClear
            >
              <Option value="active">在售</Option>
              <Option value="offline">已下架</Option>
              <Option value="pending">待审核</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button icon={<ReloadOutlined />} onClick={() => {
                const reset = { page: 1, pageSize: 10, keyword: '', status: '' };
                setParams(reset);
                fetchHouses(reset);
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
          scroll={{ x: 900 }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => {
              const newParams = { ...params, page, pageSize };
              setParams(newParams);
              fetchHouses(newParams);
            },
          }}
        />
      </Card>
    </div>
  );
}
