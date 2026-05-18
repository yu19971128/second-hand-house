/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavBar, Toast, Button, Image, Swiper, Tag, Skeleton } from 'antd-mobile';
import request from '../utils/request';

export default function HouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    (async () => {
      try {
        const res = await request.get(`/houses/${id}`);
        setHouse(res.data);
      } catch (e) {
        Toast.show({ content: e.message, icon: 'fail' });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleFavorite = async () => {
    if (!user) {
      Toast.show({ content: '请先登录', icon: 'fail' });
      navigate('/login');
      return;
    }
    try {
      const res = await request.post(`/houses/${id}/favorite`);
      setFavorited(res.data.favorited);
      Toast.show({ content: res.data.message, icon: 'success' });
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    }
  };

  if (loading) {
    return (
      <div>
        <NavBar onBack={() => navigate(-1)}>房源详情</NavBar>
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={5} animated />
      </div>
    );
  }

  if (!house) return null;

  const images = Array.isArray(house.images)
    ? house.images
    : JSON.parse(house.images || '[]');

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>房源详情</NavBar>

      {/* 图片轮播 */}
      <div style={{ background: '#e8e8e8', height: 240 }}>
        {images.length > 0 ? (
          <Swiper style={{ '--height': '240px' }}>
            {images.map((img, i) => (
              <Swiper.Item key={i}>
                <Image src={`${img}`} fit="cover" width="100%" height={240} />
              </Swiper.Item>
            ))}
          </Swiper>
        ) : (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            暂无图片
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div style={{ background: '#fff', padding: '16px 16px 12px', marginBottom: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 'bold', color: '#f40' }}>
          {house.price} <span style={{ fontSize: 14, fontWeight: 'normal', color: '#999' }}>万元</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0 6px', color: '#333' }}>
          {house.title}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="primary">{house.type}</Tag>
          <Tag>{house.area}㎡</Tag>
          <Tag>{house.region}</Tag>
          {house.floor && <Tag>{house.floor}</Tag>}
          {house.year && <Tag>{house.year}年建</Tag>}
        </div>
        {house.address && (
          <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            📍 {house.address}
          </div>
        )}
      </div>

      {/* 房源描述 */}
      {house.description && (
        <div style={{ background: '#fff', padding: '14px 16px', marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>房源描述</div>
          <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {house.description}
          </div>
        </div>
      )}

      {/* 中介信息 */}
      <div style={{ background: '#fff', padding: '14px 16px', marginBottom: 8 }}>
        <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>联系中介</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
            {house.publisher?.[0] || '中'}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{house.publisher || '匿名发布者'}</div>
            {house.publisher_phone && (
              <div style={{ fontSize: 13, color: '#666' }}>📞 {house.publisher_phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', padding: '12px 16px', display: 'flex', gap: 12, borderTop: '1px solid #f0f0f0' }}>
        <Button block onClick={handleFavorite} style={{ flex: 1 }}>
          {favorited ? '❤️ 已收藏' : '🤍 收藏'}
        </Button>
        {house.publisher_phone && (
          <Button block color="primary" style={{ flex: 2 }} onClick={() => window.open(`tel:${house.publisher_phone}`)}>
            📞 联系中介
          </Button>
        )}
      </div>
    </div>
  );
}
