import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Toast } from '@douyinfe/semi-ui';

// API响应接口
interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  requestId: string;
  success?: boolean;
}

// 用户信息接口
interface UserInfo {
  id: string;
  username: string;
  realName?: string;
  phone?: string;
  mail?: string;
  createTime?: string;
  updateTime?: string;
}

// Token管理类
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_INFO_KEY = 'user_info';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  static getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  static setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api', // 使用Next.js本地API Routes
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 根据API文档，成功的响应code应该是特定值，这里假设成功code为'0'或'200'
    if (data.code === '0' || data.code === '200' || data.success === true) {
      return data;
    } else {
      // 业务错误
      Toast.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
  },
  (error) => {
    // HTTP错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          Toast.error('登录已过期，请重新登录');
          TokenManager.removeToken();
          // 可以在这里跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          Toast.error('没有权限访问该资源');
          break;
        case 404:
          Toast.error('请求的资源不存在');
          break;
        case 500:
          Toast.error('服务器内部错误');
          break;
        default:
          Toast.error(data?.message || `请求失败 (${status})`);
      }
    } else if (error.request) {
      Toast.error('网络连接失败，请检查网络');
    } else {
      Toast.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export { request, TokenManager, type ApiResponse, type UserInfo };
export default request;