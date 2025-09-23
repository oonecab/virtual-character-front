import { fetchEventSource } from '@microsoft/fetch-event-source';
import { TokenManager } from '../../utils/request';
import AiChatService from '../../services/aiChatService';

export interface SSEMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status?: 'loading' | 'incomplete' | 'complete';
  createAt: number;
}

export interface SSEHandlerOptions {
  onMessage: (content: string) => void;
  onComplete: (finalContent: string) => void;
  onError: (error: Error) => void;
}

export class SSEHandler {
  private abortController: AbortController | null = null;
  private fullContent = '';
  private options: SSEHandlerOptions;

  constructor(options: SSEHandlerOptions) {
    this.options = options;
  }

  /**
   * 启动SSE连接
   */
  async startConnection(sessionId: string, message: string, messageSeq: number): Promise<void> {
    console.log('🚀 SSEHandler: 启动连接', { sessionId, message, messageSeq });
    
    // 关闭之前的连接
    this.closeConnection();
    
    // 重置内容
    this.fullContent = '';
    
    // 创建新的AbortController
    this.abortController = new AbortController();
    
    try {
      // 使用AiChatService构建请求
      const { url, body } = AiChatService.buildChatRequest(
        sessionId, 
        message, 
        '1', 
        messageSeq.toString()
      );
      
      // 获取token
      const token = TokenManager.getToken();

      console.log('📡 发起fetchEventSource请求:', { url, body });

      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
        
        onopen: async (response) => {
          console.log('✅ SSE连接已打开:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        },
        
        onmessage: (event) => {
          console.log('📥 收到SSE消息:', event.data);
          this.handleSSEMessage(event.data);
        },
        
        onclose: () => {
          console.log('🔒 SSE连接已关闭');
          // 连接正常关闭，触发完成回调
          if (this.fullContent) {
            this.options.onComplete(this.fullContent);
          }
        },
        
        onerror: (error) => {
          console.error('❌ SSE连接错误:', error);
          this.options.onError(error instanceof Error ? error : new Error('SSE connection error'));
          throw error; // 重新抛出错误以停止重连
        }
      });
      
    } catch (error) {
      console.error('❌ SSE连接启动失败:', error);
      this.options.onError(error instanceof Error ? error : new Error('Failed to start SSE connection'));
    }
  }

  /**
   * 处理SSE消息
   */
  private handleSSEMessage(data: string): void {
    try {
      // 检查是否是完成标识
      if (data.trim() === '[DONE]') {
        console.log('✅ 消息完成');
        this.options.onComplete(this.fullContent);
        this.closeConnection();
        return;
      }
      
      // 解析数据
      const parsedData = this.parseSSEData(data);
      if (parsedData) {
        this.fullContent += parsedData;
        console.log('📝 累积内容:', this.fullContent);
        this.options.onMessage(parsedData);
      }
    } catch (error) {
      console.error('❌ 处理SSE消息失败:', error);
      this.options.onError(error as Error);
    }
  }

  /**
   * 解析SSE数据
   */
  private parseSSEData(rawData: string): string | null {
    try {
      // 检查数据是否为空
      if (!rawData || rawData.trim() === '') {
        console.log('⚠️ 收到空数据，跳过处理');
        return null;
      }

      // 解析JSON数据
      const data = JSON.parse(rawData);
      console.log('📊 解析后的数据:', data);

      // 处理choices[0].delta.content格式
      if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
        return data.choices[0].delta.content;
      }
      
      // 兼容处理message字段
      if (data.message && (data.type === 'content' || !data.type)) {
        return data.message;
      }
      
      // 处理完成消息
      if (data.type === 'done') {
        this.options.onComplete(this.fullContent || data.message || '');
        return null;
      }

      console.log('⚠️ 未识别的数据格式:', data);
      return null;
    } catch (error) {
      console.error('❌ JSON解析失败:', error, '原始数据:', rawData);
      return null;
    }
  }

  /**
   * 关闭连接
   */
  closeConnection(): void {
    if (this.abortController) {
      console.log('🔒 关闭SSE连接');
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * 获取当前累积内容
   */
  getCurrentContent(): string {
    return this.fullContent;
  }
}