import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 扩展 AxiosInstance 接口
declare module 'axios' {
  interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  }
}

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
  timeout: 30000, // 增加到30秒，适应语音转文字的处理时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 定义不需要token的接口路径
    const noTokenPaths = [
      '/xunzhi/v1/users/login',
      '/xunzhi/v1/users/register'
    ];
    
    // 检查当前请求是否为不需要token的接口
    const isNoTokenPath = noTokenPaths.some(path => config.url?.includes(path));
    
    // 只有非登录注册接口才添加Authorization header
    if (!isNoTokenPath) {
      const token = TokenManager.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      console.error('API Error:', data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
  },
  (error) => {
    // HTTP错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('登录已过期，请重新登录');
          TokenManager.removeToken();
          // 可以在这里跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(data?.message || `请求失败，状态码：${status}`);
      }
    } else if (error.request) {
      console.error('网络连接失败，请检查网络');
    } else {
      console.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export { request, TokenManager, type ApiResponse, type UserInfo };
export default request;