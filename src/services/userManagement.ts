import {ApiResponse, request} from '@/utils/request';

// ===== 请求DTO接口 =====

// 用户登录请求DTO
export interface UserLoginReqDTO {
  username: string;
  password: string;
}

// 用户注册请求DTO
export interface UserRegisterReqDTO {
  username: string;
  password: string;
  realName: string;
  phone: string;
  mail: string;
}

// 用户更新请求DTO
export interface UserUpdateReqDTO {
  username: string;
  password: string;
  realName: string;
  phone: string;
  mail: string;
}

// 修改密码请求接口
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ===== 响应DTO接口 =====

// 用户响应DTO（脱敏）
export interface UserRespDTO {
  id: number;
  username: string;
  realName: string;
  phone: string;
  mail: string;
}

// 用户实际响应DTO（无脱敏）
export interface UserActualRespDTO {
  id: number;
  username: string;
  realName: string;
  phone: string;
  mail: string;
}

// ===== 统一响应结构 =====

// 基础响应结构
export interface BaseResult<T = any> {
  code?: string;
  message?: string;
  data: T;
  requestId?: string;
  success?: boolean;
}

// 用户信息响应
export type ResultUserRespDTO = BaseResult<UserRespDTO>

// 用户实际信息响应
export type ResultUserActualRespDTO = BaseResult<UserActualRespDTO>

// 布尔值响应
export type ResultBoolean = BaseResult<boolean>

// 空响应
export type ResultVoid = BaseResult<null>

// 登录响应（Map对象）
export interface ResultMapObject extends BaseResult<Record<string, any>> {
  success: boolean;
}

// ===== 兼容性类型别名 =====
export type LoginRequest = UserLoginReqDTO;
export type RegisterRequest = UserRegisterReqDTO;
export type UserInfo = UserRespDTO;
export type LoginResponse = ResultMapObject;
export type UsernameCheckResponse = ResultBoolean;

/**
 * 用户管理服务类
 * 封装所有用户相关的API调用
 */
export class UserManagementService {
  
  /**
   * 用户登录
   * @param loginData 登录数据
   * @returns 登录响应
   */
  static async login(loginData: UserLoginReqDTO): Promise<ResultUserActualRespDTO> {
    try {
      return await request.post<ResultUserActualRespDTO>(
        '/xunzhi/v1/users/login',
        loginData
      );
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户注册
   * @param registerData 注册数据
   * @returns 注册响应
   */
  static async register(registerData: UserRegisterReqDTO): Promise<ResultVoid> {
    try {
      return await request.post<ResultVoid>(
        '/xunzhi/v1/users/register',
        registerData
      );
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  /**
   * 检查用户名是否存在
   * @param username 用户名
   * @returns 检查结果
   */
  static async checkUsername(username: string): Promise<ResultBoolean> {
    try {
      return await request.get<ResultBoolean>(
        `/xunzhi/v1/users/check-username?username=${username}`
      );
    } catch (error) {
      console.error('检查用户名失败:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * @returns 登出响应
   */
  static async logout(): Promise<ResultVoid> {
    try {
      return await request.post<ResultVoid>('/xunzhi/v1/users/logout');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息响应
   */
  static async getCurrentUser(): Promise<ResultUserRespDTO> {
    try {
      return await request.get<ResultUserRespDTO>('/xunzhi/v1/users/current');
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param userData 用户数据
   * @returns 更新响应
   */
  static async updateUser(userData: UserUpdateReqDTO): Promise<ResultVoid> {
    try {
      return await request.put<ResultVoid>(
        '/xunzhi/v1/users/update',
        userData
      );
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   * @param passwordData 密码数据
   * @returns 修改响应
   */
  static async changePassword(passwordData: ChangePasswordRequest): Promise<ResultVoid> {
    try {
      return await request.put<ResultVoid>(
        '/xunzhi/v1/users/password',
        passwordData
      );
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }
}

// 导出默认实例
export default UserManagementService;