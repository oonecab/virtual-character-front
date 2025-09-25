// 历史消息查询服务
import { request } from '../utils/request';

export interface HistoryMessage {
  id: string;
  sessionId: string;
  messageType: number; // 1-用户消息，2-AI回复
  messageContent: string;
  messageSeq: number;
  tokenCount: number;
  responseTime: number;
  errorMessage: string;
  createTime: string;
}

export interface ConversationSession {
  sessionId: string;
  username: string;
  aiId: number;
  aiName: string;
  title: string;
  status: number; // 1-进行中，2-已结束
  messageCount: number;
  lastMessageTime: string;
  createTime: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
  requestId: string;
  success: boolean;
}

class HistoryService {
  /**
   * 分页查询会话列表
   */
  async getConversations(params: {
    current?: number;
    size?: number;
    aiId?: number;
    status?: number;
    title?: string;
  } = {}): Promise<PageResult<ConversationSession>> {
    const queryParams = new URLSearchParams();
    
    // 设置默认值
    queryParams.append('current', (params.current || 1).toString());
    queryParams.append('size', (params.size || 20).toString());
    
    // 添加可选参数
    if (params.aiId !== undefined) {
      queryParams.append('aiId', params.aiId.toString());
    }
    if (params.status !== undefined) {
      queryParams.append('status', params.status.toString());
    }
    if (params.title) {
      queryParams.append('title', params.title);
    }

    try {
      const response = await request.get<ApiResponse<PageResult<ConversationSession>>>(
        `/xunzhi/v1/ai/conversations?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  }

  /**
   * 查询指定会话的历史消息
   */
  async getSessionHistory(sessionId: string): Promise<HistoryMessage[]> {
    try {
      console.log('🌐 historyService: 发起API请求获取历史消息, sessionId:', sessionId);
      
      const response = await request.get<ApiResponse<HistoryMessage[]>>(
        `/xunzhi/v1/ai/history/${sessionId}`
      );

      console.log('📡 historyService: API响应:', response);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ historyService: 获取历史消息失败:', error);
      throw error;
    }
  }

  /**
   * 分页查询历史消息
   */
  async getHistoryMessages(params: {
    sessionId?: string;
    current: number;
    size: number;
  }): Promise<PageResult<HistoryMessage>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('current', params.current.toString());
    queryParams.append('size', params.size.toString());
    
    if (params.sessionId) {
      queryParams.append('sessionId', params.sessionId);
    }

    try {
      const response = await request.get<ApiResponse<PageResult<HistoryMessage>>>(
        `/xunzhi/v1/ai/history/page?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('获取历史消息失败:', error);
      throw error;
    }
  }

  /**
   * 格式化时间显示
   */
  formatTime(timeStr: string): string {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 小于1分钟
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      
      // 小于1小时
      if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}分钟前`;
      }
      
      // 小于1天
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}小时前`;
      }
      
      // 小于7天
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}天前`;
      }
      
      // 超过7天显示具体日期
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('时间格式化失败:', error);
      return timeStr;
    }
  }

  /**
   * 将API返回的历史消息转换为聊天室消息格式
   */
  convertToMessages(historyMessages: HistoryMessage[]): Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }> {
    return historyMessages.map(msg => ({
      role: msg.messageType === 1 ? 'user' : 'assistant',
      content: msg.messageContent,
      timestamp: new Date(msg.createTime)
    }));
  }
}

export default new HistoryService();