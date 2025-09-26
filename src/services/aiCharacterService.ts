import { request, type ApiResponse } from '../utils/request';

// AI角色数据接口
export interface AiCharacter {
  id: number;
  aiName: string;
  aiAvatar: string;
  description: string;
  aiPrompt: string;
  voiceDetailId: number;
  createTime: string;
  updateTime: string;
}

// 分页请求参数
export interface AiCharacterPageReqDTO {
  current?: number; // 当前页码，默认1
  size?: number; // 每页大小，默认10
  aiName?: string; // 角色名称搜索
}

// 分页响应数据
export interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  optimizeCountSql: boolean;
  searchCount: boolean;
  optimizeJoinOfCountSql: boolean;
  maxLimit: number;
  countId: string;
  orders: Array<{
    column: string;
    asc: boolean;
  }>;
}

// 搜索请求参数
export interface AiCharacterSearchReqDTO {
  aiName: string;
}

// API响应类型
type AiCharacterPageResponse = ApiResponse<PageData<AiCharacter>>;
type AiCharacterListResponse = ApiResponse<AiCharacter[]>;

/**
 * AI角色服务类
 */
export class AiCharacterService {
  /**
   * 分页查询AI角色列表
   * @param params 分页参数
   * @returns Promise<PageData<AiCharacter>>
   */
  static async getAiCharacterPage(params: AiCharacterPageReqDTO = {}): Promise<PageData<AiCharacter>> {
    const defaultParams: AiCharacterPageReqDTO = {
      current: 1,
      size: 10,
      ...params
    };

    try {
      const response: AiCharacterPageResponse = await request.post('/ai-character/page', defaultParams);
      return response.data;
    } catch (error) {
      console.error('获取AI角色分页数据失败:', error);
      throw error;
    }
  }

  /**
   * 查询所有AI角色
   * @returns Promise<AiCharacter[]>
   */
  static async getAllAiCharacters(): Promise<AiCharacter[]> {
    try {
      const response: AiCharacterListResponse = await request.get('/ai-character/list');
      return response.data;
    } catch (error) {
      console.error('获取所有AI角色失败:', error);
      throw error;
    }
  }

  /**
   * 根据名称搜索AI角色
   * @param aiName 角色名称
   * @returns Promise<AiCharacter[]>
   */
  static async searchAiCharacters(aiName: string): Promise<AiCharacter[]> {
    try {
      const response: AiCharacterListResponse = await request.post('/ai-character/search', { aiName });
      return response.data;
    } catch (error) {
      console.error('搜索AI角色失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID查询AI角色详情
   * @param id 角色ID
   * @returns Promise<AiCharacter>
   */
  static async getAiCharacterById(id: number): Promise<AiCharacter> {
    try {
      const response: ApiResponse<AiCharacter> = await request.get(`/ai-character/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取AI角色详情失败:', error);
      throw error;
    }
  }
}

export default AiCharacterService;