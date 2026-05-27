/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Tabs, Card, Button, Toast, Dialog, Tag, Empty } from 'antd-mobile';
import request from '../utils/request';
import moment from 'moment';


function HouseItem({ house, onNavigate, onOffline, onEdit }) {
  const images = (() => {
    try {
      return Array.isArray(house.images) ? house.images : JSON.parse(house.images || '[]');
    } catch { return []; }
  })();

  return (
    <Card
      style={{ margin: '8px 12px', borderRadius: 8 }}
      onClick={() => onNavigate(house.id)}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
          {images.length > 0
            ? <img src={`${images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '暂无图片'
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{house.title}</div>
          <div style={{ color: '#f40', fontSize: 16, fontWeight: 'bold', margin: '4px 0' }}>{house.price} 万</div>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>{house.region}</span>
            <Tag style={{ fontSize: 11 }}>{house.type}</Tag>
            <Tag
              color={house.status === 'active' ? 'success' : 'danger'}
              style={{ fontSize: 11 }}
            >
              {house.status === 'active' ? '在售' : '已下架'}
            </Tag>
          </div>
        </div>
      </div>
      {(onEdit || (onOffline && house.status === 'active')) && (
        <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {onEdit && (
            <Button
              size="mini"
              color="primary"
              fill="outline"
              onClick={(e) => { e.stopPropagation(); onEdit(house.id); }}
            >
              编辑
            </Button>
          )}
          {onOffline && house.status === 'active' && (
            <Button
              size="mini"
              color="danger"
              fill="outline"
              onClick={(e) => { e.stopPropagation(); onOffline(house.id); }}
            >
              下架
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function Appointments({ house, onNavigate, onOffline, onEdit }) {
  const house_images = (() => {
    try {
      return Array.isArray(house.house_images) ? house.house_images : JSON.parse(house.house_images || '[]');
    } catch { return []; }
  })();

  return (
    <Card
      style={{ margin: '8px 12px', borderRadius: 8 }}
      onClick={() => onNavigate(house.id)}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
          {house_images.length > 0
            ? <img src={`${house_images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '暂无图片'
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{house.house_title}</div>
          <div style={{ color: '#f40', fontSize: 12, fontWeight: 'bold', margin: '4px 0' }}>预约时间:{moment(house.appoint_time).format('YYYY-MM-DD')}</div>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>{house.house_region}</span>
            <Tag style={{ fontSize: 11 }}>{house.house_type}</Tag>
            <Tag
              color={house.status === 'active' ? 'success' : 'danger'}
              style={{ fontSize: 11 }}
            >
              {house.house_status === 'active' ? '在售' : '已下架'}
            </Tag>
             <Tag
              color={house.status === 'reject' ? 'success' : 'danger'}
              style={{ fontSize: 11 }}
            >
              {house.status === 'reject' ? '预约成功' : '等待同意'}
            </Tag>
          </div>
        </div>
      </div>
      {(onEdit || (onOffline && house.status === 'active')) && (
        <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {onEdit && (
            <Button
              size="mini"
              color="primary"
              fill="outline"
              onClick={(e) => { e.stopPropagation(); onEdit(house.id); }}
            >
              编辑
            </Button>
          )}
          {onOffline && house.status === 'active' && (
            <Button
              size="mini"
              color="danger"
              fill="outline"
              onClick={(e) => { e.stopPropagation(); onOffline(house.id); }}
            >
              下架
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function AggentAppointments({ house, onNavigate,onAccept }) {
  const house_images = (() => {
    try {
      return Array.isArray(house.house_images) ? house.house_images : JSON.parse(house.house_images || '[]');
    } catch { return []; }
  })();

  return (
    <Card
      style={{ margin: '8px 12px', borderRadius: 8 }}
      onClick={() => onNavigate(house.id)}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
          {house_images.length > 0
            ? <img src={`${house_images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '暂无图片'
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{house.house_title}</div>
          <div style={{ color: '#f40', fontSize: 12, fontWeight: 'bold', margin: '4px 0' }}>预约时间: {moment(house.appoint_time).format('YYYY-MM-DD')}</div>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>{house.house_region}</span>
            <Tag style={{ fontSize: 11 }}>{house.house_type}</Tag>
          </div>
          {/* 显示预约者信息 */}
          <div style={{ fontSize: 12, color: '#1677ff', marginTop: 4 }}>
            预约人: {house.buyer_name || '未知'}
            {house.buyer_phone && <span style={{ marginLeft: 6 }}>📞 {house.buyer_phone}</span>}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button
          size="mini"
          color="primary"
          fill="outline"
          onClick={(e) => { e.stopPropagation(); onAccept(house.id); }}
        >
          接受
        </Button>
        </div>
    </Card>
  );
}

export default function My() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [myHouses, setMyHouses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [agentAppointments, setAgentAppointments] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    // 只有中介和管理员才请求房源数据
    if (user?.role === 'agent' || user?.role === 'admin') {
      fetchMyHouses();
      fetchAgentAppointments();
    }
    fetchFavorites();
    // 只有买家角色才请求预约数据
    if (user?.role === 'buyer') {
      fetchAppointments();
    }
  }, []);

  const fetchMyHouses = async () => {
    try {
      const res = await request.get('/houses/user/my');
      setMyHouses(res.data.list);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoadingHouses(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await request.get('/houses/user/favorites');
      setFavorites(res.data.list);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await request.get('/appointments/list');
      setAppointments(res.data.list);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    }
  };

  const fetchAgentAppointments = async () => {
    try {
      const res = await request.get('/appointments/agent');
      setAgentAppointments(res.data.list);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    }
  };

  const handleOffline = async (id) => {
    const result = await Dialog.confirm({ content: '确定下架该房源吗？' });
    if (!result) return;
    try {
      await request.delete(`/houses/${id}`);
      Toast.show({ content: '已下架', icon: 'success' });
      fetchMyHouses();
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    }
  };

  const handleLogout = () => {
    Dialog.confirm({ content: '确定退出登录吗？' }).then(ok => {
      if (ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    });
  };

  const handleAccept = async (id) => {
    await request.post('/appointments/editAgentStatus', { id, status: 'reject' });
    Toast.show({ content: '已接受', icon: 'success' });
    fetchAgentAppointments();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar
        onBack={() => navigate('/')}
        right={<span style={{ fontSize: 13, color: '#f40', cursor: 'pointer' }} onClick={handleLogout}>退出</span>}
        style={{ background: '#fff' }}
      >
        我的
      </NavBar>

      {/* 用户信息 */}
      <div style={{ background: '#1677ff', padding: '20px 20px 40px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={() => navigate('/edit-profile')}
          style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 'bold', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
        >
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div onClick={() => navigate('/edit-profile')} style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>{user?.username}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            {user?.role === 'agent' ? '中介经纪人' : user?.role === 'admin' ? '管理员' : '普通用户'}
            <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>编辑资料 &gt;</span>
          </div>
        </div>
        {/* 只有中介和管理员才能发布房源 */}
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Button
            size="mini"
            fill="outline"
            style={{ marginLeft: 'auto', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
            onClick={() => navigate('/publish')}
          >
            + 发布房源
          </Button>
        )}
      </div>

      <div style={{ marginTop: -20, borderRadius: '20px 20px 0 0', background: '#f5f5f5', paddingTop: 8 }}>
        <Tabs defaultActiveKey={user?.role === 'buyer' ? 'favorites' : 'my-houses'}>
          {/* 只有中介和管理员才显示"我发布的"tab */}
          {(user?.role === 'agent' || user?.role === 'admin') && (
            <Tabs.Tab title={`我发布的（${myHouses.length}）`} key="my-houses">
              {loadingHouses ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>加载中...</div>
              ) : myHouses.length === 0 ? (
                <Empty description="还没有发布过房源" style={{ paddingTop: 40 }} />
              ) : (
                myHouses.map(h => (
                  <HouseItem
                    key={h.id}
                    house={h}
                    onNavigate={(id) => navigate(`/house/${id}`)}
                    onOffline={handleOffline}
                    onEdit={(id) => navigate(`/edit-house/${id}`)}
                  />
                ))
              )}
            </Tabs.Tab>
          )}

          <Tabs.Tab title={`我的收藏（${favorites.length}）`} key="favorites">
            {loadingFavorites ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>加载中...</div>
            ) : favorites.length === 0 ? (
              <Empty description="还没有收藏任何房源" style={{ paddingTop: 40 }} />
            ) : (
              favorites.map(h => (
                <HouseItem
                  key={h.id}
                  house={h}
                  onNavigate={(id) => navigate(`/house/${id}`)}
                />
              ))
            )}
          </Tabs.Tab>

          {/* 只有买家角色才显示"我的预约"tab */}
          {user?.role === 'buyer' && (
            <Tabs.Tab title={`我的预约（${appointments.length}）`} key="appointments">
              {appointments.length === 0 ? (
                <Empty description="还没有预约任何房源" style={{ paddingTop: 40 }} />
              ) : (
                appointments.map(h => (
                  <Appointments
                    key={h.id}
                    house={h}
                    onNavigate={(id) => navigate(`/house/${id}`)}
                  />
                ))
              )}
            </Tabs.Tab>
          )}

          {/* 只有中介和管理员才显示"我的约看"tab */}
          {(user?.role === 'agent' || user?.role === 'admin') && (
            <Tabs.Tab title={`我的约看（${agentAppointments.length}）`} key="agent-appointments">
              {agentAppointments.length === 0 ? (
                <Empty description="还没有人预约您的房源" style={{ paddingTop: 40 }} />
              ) : (
                agentAppointments.map(h => (
                  <AggentAppointments
                    key={h.id}
                    house={h}
                    onNavigate={(id) => navigate(`/house/${id}`)}
                    onAccept={(id) => { handleAccept(id); }}
                  />
                ))
              )}
            </Tabs.Tab>
          )}
        </Tabs>
      </div>
    </div>
  );
}
