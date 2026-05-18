import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast, NavBar, Selector, TextArea, ImageUploader } from 'antd-mobile';

const REGIONS = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '顺义区', '昌平区', '通州区'];
const TYPES = ['一室', '二室', '三室', '四室', '五室及以上'];

export default function Publish() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const uploadImage = async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('images', file);
    const res = await fetch('/api/houses/upload-temp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    return { url: data.path };
  };

  const handleSubmit = async (values) => {
    if (!values.region || !values.region[0]) {
      Toast.show({ content: '请选择地区', icon: 'fail' });
      return;
    }
    if (!values.type || !values.type[0]) {
      Toast.show({ content: '请选择户型', icon: 'fail' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('price', values.price);
      formData.append('area', values.area);
      formData.append('region', values.region[0]);
      formData.append('type', values.type[0]);
      if (values.address) formData.append('address', values.address);
      if (values.floor) formData.append('floor', values.floor);
      if (values.year) formData.append('year', values.year);
      if (values.description) formData.append('description', values.description);

      // 把已通过 upload-temp 上传的图片路径带上
      fileList.forEach(item => {
        if (item.url) formData.append('imageUrls', item.url);
      });

      const token = localStorage.getItem('token');
      const res = await fetch('/api/houses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        Toast.show({ content: '房源发布成功！', icon: 'success' });
        navigate('/my');
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 80 }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>发布房源</NavBar>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ background: '#fff', margin: '8px 0' }}
        footer={
          <div style={{ padding: '0 16px 16px' }}>
            <Button block color="primary" type="submit" loading={loading} size="large">
              立即发布
            </Button>
          </div>
        }
      >
        <Form.Item name="title" label="房源标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="如：朝阳区精装两居室 近地铁" />
        </Form.Item>

        <Form.Item name="price" label="价格（万元）" rules={[{ required: true, message: '请输入价格' }]}>
          <Input type="number" placeholder="如：280" />
        </Form.Item>

        <Form.Item name="area" label="面积（平方米）" rules={[{ required: true, message: '请输入面积' }]}>
          <Input type="number" placeholder="如：89.5" />
        </Form.Item>

        <Form.Item name="region" label="所在地区" rules={[{ required: true, message: '请选择地区' }]}>
          <Selector
            options={REGIONS.map(r => ({ label: r, value: r }))}
          />
        </Form.Item>

        <Form.Item name="type" label="户型" rules={[{ required: true, message: '请选择户型' }]}>
          <Selector
            options={TYPES.map(t => ({ label: t, value: t }))}
          />
        </Form.Item>

        <Form.Item name="address" label="详细地址">
          <Input placeholder="如：朝阳区建国路88号" />
        </Form.Item>

        <Form.Item name="floor" label="楼层">
          <Input placeholder="如：12/25层" />
        </Form.Item>

        <Form.Item name="year" label="建造年份">
          <Input type="number" placeholder="如：2015" />
        </Form.Item>

        <Form.Item name="description" label="房源描述">
          <TextArea placeholder="请详细描述房源情况，如装修情况、配套设施等..." rows={4} maxLength={500} showCount />
        </Form.Item>

        <Form.Item label="房源图片（最多5张）" style={{ padding: '12px 16px' }}>
          <ImageUploader
            value={fileList}
            onChange={setFileList}
            upload={uploadImage}
            maxCount={5}
            multiple
          />
        </Form.Item>
      </Form>
    </div>
  );
}
