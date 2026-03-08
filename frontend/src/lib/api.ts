import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://www.projektrage.com.br/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use(config => {
  const token = Cookies.get('mt5_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        Cookies.set('mt5_token', data.access_token, {
          expires: 1,
          sameSite: 'strict',
        });
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        Cookies.remove('mt5_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);
