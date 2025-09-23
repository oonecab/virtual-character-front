// Token测试工具
import { request, TokenManager } from './request';

export class TokenTestUtils {
  /**
   * 测试token是否正确存储
   */
  static testTokenStorage() {
    console.log('=== Token存储测试 ===');
    
    // 测试设置token
    const testToken = 'd439992e-6095-4def-90b2-b5c9739d19b9';
    TokenManager.setToken(testToken);
    
    // 测试获取token
    const retrievedToken = TokenManager.getToken();
    console.log('设置的token:', testToken);
    console.log('获取的token:', retrievedToken);
    console.log('token存储测试:', testToken === retrievedToken ? '✅ 通过' : '❌ 失败');
    
    return testToken === retrievedToken;
  }

  /**
   * 测试请求头中是否正确携带token
   */
  static async testTokenInHeaders() {
    console.log('=== Token请求头测试 ===');
    
    // 设置测试token
    const testToken = 'd439992e-6095-4def-90b2-b5c9739d19b9';
    TokenManager.setToken(testToken);
    
    try {
      // 创建一个测试请求拦截器来检查headers
      const originalRequest = request.interceptors.request.use;
      let capturedHeaders: any = null;
      
      // 临时拦截器来捕获headers
      const interceptorId = request.interceptors.request.use((config) => {
        capturedHeaders = config.headers;
        console.log('请求URL:', config.url);
        console.log('请求Headers:', config.headers);
        
        // 检查Authorization header
        if (config.headers?.Authorization) {
          console.log('Authorization header:', config.headers.Authorization);
          const expectedAuth = `Bearer ${testToken}`;
          if (config.headers.Authorization === expectedAuth) {
            console.log('✅ Token正确携带在请求头中');
          } else {
            console.log('❌ Token格式不正确');
            console.log('期望:', expectedAuth);
            console.log('实际:', config.headers.Authorization);
          }
        } else {
          console.log('❌ 未找到Authorization header');
        }
        
        return config;
      });
      
      // 发送一个测试请求（这会被拦截，不会真正发送）
      try {
        await request.get('/test/token-check');
      } catch (error) {
        // 忽略网络错误，我们只关心headers
        console.log('测试请求完成（忽略网络错误）');
      }
      
      // 移除临时拦截器
      request.interceptors.request.eject(interceptorId);
      
      return capturedHeaders?.Authorization === `Bearer ${testToken}`;
    } catch (error) {
      console.error('Token请求头测试失败:', error);
      return false;
    }
  }

  /**
   * 测试登录和注册接口是否不携带token
   */
  static async testNoTokenPaths() {
    console.log('=== 登录注册接口Token豁免测试 ===');
    
    // 设置测试token
    const testToken = 'd439992e-6095-4def-90b2-b5c9739d19b9';
    TokenManager.setToken(testToken);
    
    const testPaths = [
      '/xunzhi/v1/users/login',
      '/xunzhi/v1/users/register'
    ];
    
    for (const path of testPaths) {
      try {
        let hasAuthHeader = false;
        
        // 临时拦截器来检查这些路径是否携带token
        const interceptorId = request.interceptors.request.use((config) => {
          if (config.url?.includes(path)) {
            hasAuthHeader = !!config.headers?.Authorization;
            console.log(`路径 ${path}:`, hasAuthHeader ? '❌ 携带了token' : '✅ 未携带token');
          }
          return config;
        });
        
        // 发送测试请求
        try {
          await request.post(path, {});
        } catch (error) {
          // 忽略网络错误
        }
        
        // 移除拦截器
        request.interceptors.request.eject(interceptorId);
        
      } catch (error) {
        console.error(`测试路径 ${path} 失败:`, error);
      }
    }
  }

  /**
   * 运行所有token测试
   */
  static async runAllTests() {
    console.log('🚀 开始Token功能测试...\n');
    
    const storageTest = this.testTokenStorage();
    console.log('');
    
    const headerTest = await this.testTokenInHeaders();
    console.log('');
    
    await this.testNoTokenPaths();
    console.log('');
    
    console.log('📊 测试结果汇总:');
    console.log('Token存储:', storageTest ? '✅ 通过' : '❌ 失败');
    console.log('Token请求头:', headerTest ? '✅ 通过' : '❌ 失败');
    console.log('登录注册豁免: 请查看上方详细日志');
    
    return {
      storage: storageTest,
      headers: headerTest
    };
  }
}

// 在浏览器控制台中可以直接调用的测试函数
if (typeof window !== 'undefined') {
  (window as any).testToken = TokenTestUtils.runAllTests.bind(TokenTestUtils);
  console.log('💡 提示: 在浏览器控制台中输入 testToken() 来运行token测试');
}