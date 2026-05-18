import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器：自动附加 JWT Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || '网络请求失败';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(msg));
  }
);

export default request;
