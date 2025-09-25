import { request } from '../utils/request';
import { TokenManager } from '../utils/request';

// AI对话相关的接口类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSessionRequest {
  aiId: number;
  firstMessage: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  message?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  inputMessage: string;
  aiId: string;
  messageSeq: string;
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  requestId: string;
  success?: boolean;
}

/**
 * AI聊天服务类
 * 封装所有AI对话相关的API请求
 */
export class AiChatService {
  /**
   * 创建新的AI会话
   * @param firstMessage 首条消息内容
   * @param aiId AI模型ID，默认为1
   * @returns Promise<ChatSession | null>
   */
  static async createSession(
    firstMessage: string, 
    aiId: number = 1
  ): Promise<ChatSession | null> {
    try {
      const requestData: CreateSessionRequest = {
        aiId,
        firstMessage
      };

      const response = await request.post<ApiResponse<CreateSessionResponse>>(
        '/xunzhi/v1/ai/conversations',
        requestData
      );

      if (response.success || response.code === '0' || response.code === '200') {
        return {
          sessionId: response.data.sessionId,
          title: firstMessage.slice(0, 50), // 使用前50个字符作为标题
          createdAt: new Date()
        };
      } else {
        throw new Error(response.message || '创建会话失败');
      }
    } catch (error) {
      console.error('创建AI会话失败:', error);
      throw error;
    }
  }

  /**
   * 构建SSE聊天请求的URL和请求体
   * @param sessionId 会话ID
   * @param message 消息内容
   * @param aiId AI ID
   * @param messageSeq 消息序号
   * @returns 包含URL和请求体的对象
   */
  static buildChatRequest(
    sessionId: string,
    message: string,
    aiId: string = '1',
    messageSeq: string
  ) {
    const requestBody = {
      sessionId,
      inputMessage: message,
      aiId,
      messageSeq
    };

    const url = `/api/xunzhi/v1/ai/sessions/${sessionId}/chat`;
    
    return {
      url,
      body: requestBody
    };
  }

  /**
   * 获取会话历史消息
   * @param sessionId 会话ID
   * @returns Promise<Message[]>
   */
  static async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      console.log('🌐 AiChatService.getSessionMessages 被调用，sessionId:', sessionId);
      console.log('📡 发起GET请求到:', `/xunzhi/v1/ai/sessions/${sessionId}/messages`);
      
      const response = await request.get<ApiResponse<Message[]>>(
        `/xunzhi/v1/ai/sessions/${sessionId}/messages`
      );

      console.log('📨 AiChatService.getSessionMessages API响应:', response);

      if (response.success || response.code === '0' || response.code === '200') {
        return response.data || [];
      } else {
        throw new Error(response.message || '获取消息历史失败');
      }
    } catch (error) {
      console.error('❌ AiChatService.getSessionMessages 失败:', error);
      return [];
    }
  }

  /**
   * 获取用户的所有会话列表
   * @returns Promise<ChatSession[]>
   */
  static async getUserSessions(): Promise<ChatSession[]> {
    try {
      const response = await request.get<ApiResponse<ChatSession[]>>(
        '/xunzhi/v1/ai/sessions'
      );

      if (response.success || response.code === '0' || response.code === '200') {
        return response.data || [];
      } else {
        throw new Error(response.message || '获取会话列表失败');
      }
    } catch (error) {
      console.error('获取用户会话列表失败:', error);
      return [];
    }
  }

  /**
   * 删除会话
   * @param sessionId 会话ID
   * @returns Promise<boolean>
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await request.delete<ApiResponse<void>>(
        `/xunzhi/v1/ai/sessions/${sessionId}`
      );

      return response.success || response.code === '0' || response.code === '200';
    } catch (error) {
      console.error('删除会话失败:', error);
      return false;
    }
  }

  /**
   * 更新会话标题
   * @param sessionId 会话ID
   * @param title 新标题
   * @returns Promise<boolean>
   */
  static async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const response = await request.put<ApiResponse<void>>(
        `/xunzhi/v1/ai/sessions/${sessionId}`,
        { title }
      );

      return response.success || response.code === '0' || response.code === '200';
    } catch (error) {
      console.error('更新会话标题失败:', error);
      return false;
    }
  }

  /**
   * 获取会话详情
   * @param sessionId 会话ID
   * @returns Promise<ChatSession | null>
   */
  static async getSessionDetail(sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await request.get<ApiResponse<ChatSession>>(
        `/xunzhi/v1/ai/sessions/${sessionId}`
      );

      if (response.success || response.code === '0' || response.code === '200') {
        return response.data;
      } else {
        throw new Error(response.message || '获取会话详情失败');
      }
    } catch (error) {
      console.error('获取会话详情失败:', error);
      return null;
    }
  }
}

export default AiChatService;