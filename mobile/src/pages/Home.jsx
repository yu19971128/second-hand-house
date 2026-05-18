/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, Selector, Popup, Button, Toast, InfiniteScroll, NavBar, Badge } from 'antd-mobile';
import request from '../utils/request';

const REGIONS = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '顺义区', '昌平区', '通州区'];
const TYPES = ['一室', '二室', '三室', '四室', '五室及以上'];
const PRICE_RANGES = [
  { label: '不限', value: '' },
  { label: '100万以下', value: '0,100' },
  { label: '100-300万', value: '100,300' },
  { label: '300-500万', value: '300,500' },
  { label: '500万以上', value: '500,' },
];

function HouseCard({ house, onClick }) {
  const images = Array.isArray(house.images) ? house.images : (typeof house.images === 'string' ? JSON.parse(house.images || '[]') : []);
  return (
    <div className="house-card" onClick={() => onClick(house.id)} style={{ cursor: 'pointer' }}>
      <div className="house-card-img">
        {images.length > 0
          ? <img src={`${images[0]}`} alt={house.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>暂无图片</span>
        }
      </div>
      <div className="house-card-info">
        <div className="house-price">{house.price}<span> 万</span></div>
        <div className="house-title">{house.title}</div>
        <div className="house-meta">
          <span>{house.region}</span>
          <span className="tag">{house.type}</span>
          <span>{house.area}㎡</span>
          {house.floor && <span>{house.floor}</span>}
        </div>
        <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>
          {house.publisher && `中介：${house.publisher}`}
          <span style={{ float: 'right' }}>👁 {house.view_count}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({ region: '', type: '', priceRange: '' });
  const [tempFilters, setTempFilters] = useState({ region: '', type: '', priceRange: '' });
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchHouses = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const priceArr = filters.priceRange ? filters.priceRange.split(',') : [];
      const params = {
        keyword,
        page: currentPage,
        pageSize: 10,
        ...(filters.region && { region: filters.region }),
        ...(filters.type && { type: filters.type }),
        ...(priceArr[0] && { minPrice: priceArr[0] }),
        ...(priceArr[1] && { maxPrice: priceArr[1] }),
      };
      const res = await request.get('/houses', { params });
      const newList = res.data.list;
      setList(prev => reset ? newList : [...prev, ...newList]);
      setHasMore(currentPage < res.data.totalPages);
      setPage(reset ? 2 : currentPage + 1);
    } catch (e) {
      Toast.show({ content: e.message, icon: 'fail' });
    } finally {
      setLoading(false);
    }
  }, [page, keyword, filters, loading]);

  useEffect(() => {
    setList([]);
    setPage(1);
    setHasMore(true);
  }, [keyword, filters]);

  useEffect(() => {
    if (page === 1) {
      fetchHouses(true);
    }
  }, [page]); // eslint-disable-line

  const handleSearch = (val) => {
    setKeyword(val);
  };

  const applyFilter = () => {
    setFilters({ ...tempFilters });
    setShowFilter(false);
  };

  const resetFilter = () => {
    const empty = { region: '', type: '', priceRange: '' };
    setTempFilters(empty);
    setFilters(empty);
    setShowFilter(false);
  };

  const loadMore = async () => {
    await fetchHouses(false);
  };

  return (
    <div className="page-container">
      <NavBar
        back={null}
        right={
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, cursor: 'pointer', color: '#1677ff' }} onClick={() => setShowFilter(true)}>筛选</span>
            {user
              ? <span style={{ fontSize: 13, cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/my')}>我的</span>
              : <span style={{ fontSize: 13, cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/login')}>登录</span>
            }
          </div>
        }
        style={{ background: '#fff', '--height': '48px', fontWeight: 'bold' }}
      >
        二手房
      </NavBar>

      <div style={{ background: '#fff', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <SearchBar
          placeholder="搜索地区、小区、描述..."
          style={{ flex: 1 }}
          onSearch={handleSearch}
          onClear={() => setKeyword('')}
        />
        {user && (
          <Button size="small" color="primary" onClick={() => navigate('/publish')}>发布</Button>
        )}
      </div>

      {(filters.region || filters.type || filters.priceRange) && (
        <div style={{ background: '#fff7f0', padding: '6px 12px', fontSize: 12, color: '#f57c00', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          当前筛选：
          {filters.region && <Badge content={filters.region} color="orange" />}
          {filters.type && <Badge content={filters.type} color="orange" />}
          {filters.priceRange && <Badge content={PRICE_RANGES.find(p => p.value === filters.priceRange)?.label} color="orange" />}
          <span style={{ color: '#999', cursor: 'pointer' }} onClick={resetFilter}>清除</span>
        </div>
      )}

      <div style={{ padding: '4px 0' }}>
        {list.map(house => (
          <HouseCard key={house.id} house={house} onClick={(id) => navigate(`/house/${id}`)} />
        ))}
      </div>

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
        {hasMore ? <span>加载中...</span> : <span style={{ color: '#ccc', fontSize: 12 }}>— 没有更多了 —</span>}
      </InfiniteScroll>

      {/* 筛选面板 */}
      <Popup visible={showFilter} onMaskClick={() => setShowFilter(false)} position="right" bodyStyle={{ width: '80vw', maxWidth: 360, padding: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>筛选条件</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>地区</div>
          <Selector
            options={[{ label: '不限', value: '' }, ...REGIONS.map(r => ({ label: r, value: r }))]}
            value={[tempFilters.region]}
            onChange={vals => setTempFilters(prev => ({ ...prev, region: vals[0] || '' }))}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>户型</div>
          <Selector
            options={[{ label: '不限', value: '' }, ...TYPES.map(t => ({ label: t, value: t }))]}
            value={[tempFilters.type]}
            onChange={vals => setTempFilters(prev => ({ ...prev, type: vals[0] || '' }))}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>价格范围</div>
          <Selector
            options={PRICE_RANGES}
            value={[tempFilters.priceRange]}
            onChange={vals => setTempFilters(prev => ({ ...prev, priceRange: vals[0] || '' }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button block onClick={resetFilter}>重置</Button>
          <Button block color="primary" onClick={applyFilter}>确定</Button>
        </div>
      </Popup>
    </div>
  );
}
