import { fetchEventSource } from '@microsoft/fetch-event-source';
import { TokenManager } from '../../utils/request';
import AiChatService from '../../services/aiChatService';

export interface SSEMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status?: 'loading' | 'incomplete' | 'complete' | 'error';
  createAt: number;
}

export interface SSEHandlerOptions {
  onMessage: (content: string) => void;
  onComplete: (finalContent: string) => void;
  onError: (error: Error) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

// 消息队列项
interface MessageQueueItem {
  content: string;
  timestamp: number;
}

export class SSEHandler {
  private abortController: AbortController | null = null;
  private fullContent = '';
  private options: SSEHandlerOptions;
  private messageQueue: MessageQueueItem[] = [];
  private isProcessingQueue = false;
  private typewriterTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private connectionId = 0; // 用于标识连接，避免竞争

  // 打字机效果配置
  private readonly TYPEWRITER_DELAY = 30; // 每个字符的延迟（毫秒）
  private readonly BATCH_SIZE = 2; // 每次处理的字符数

  constructor(options: SSEHandlerOptions) {
    this.options = options;
  }

  /**
   * 启动SSE连接
   */
  async startConnection(sessionId: string, message: string, messageSeq: number): Promise<void> {
    const currentConnectionId = ++this.connectionId;
    console.log(`🚀 SSEHandler: 启动连接 #${currentConnectionId}`, { sessionId, message, messageSeq });
    
    // 立即关闭之前的连接
    this.closeConnection();
    
    // 重置状态
    this.fullContent = '';
    this.messageQueue = [];
    this.isProcessingQueue = false;
    this.isConnected = false;
    
    // 创建新的AbortController
    this.abortController = new AbortController();
    
    // 通知连接状态
    this.options.onStatusChange?.('connecting');
    
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

      console.log(`📡 发起fetchEventSource请求 #${currentConnectionId}:`, { url, body });

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
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 已被替换，忽略`);
            return;
          }
          
          console.log(`✅ SSE连接已打开 #${currentConnectionId}:`, response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          this.isConnected = true;
          this.options.onStatusChange?.('connected');
        },
        
        onmessage: (event) => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 消息被忽略`);
            return;
          }
          
          console.log(`📥 收到SSE消息 #${currentConnectionId}:`, event.data);
          this.handleSSEMessage(event.data);
        },
        
        onclose: () => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 关闭被忽略`);
            return;
          }
          
          console.log(`🔒 SSE连接已关闭 #${currentConnectionId}`);
          this.isConnected = false;
          this.options.onStatusChange?.('disconnected');
          
          // 处理剩余队列并完成
          this.finishProcessing();
        },
        
        onerror: (error) => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 错误被忽略`);
            return;
          }
          
          console.error(`❌ SSE连接错误 #${currentConnectionId}:`, error);
          this.isConnected = false;
          this.options.onStatusChange?.('error');
          this.options.onError(error instanceof Error ? error : new Error('SSE connection error'));
          throw error; // 重新抛出错误以停止重连
        }
      });
      
    } catch (error) {
      // 检查连接是否已被替换
      if (currentConnectionId !== this.connectionId) {
        console.log(`⚠️ 连接 #${currentConnectionId} 启动错误被忽略`);
        return;
      }
      
      console.error(`❌ SSE连接启动失败 #${currentConnectionId}:`, error);
      this.isConnected = false;
      this.options.onStatusChange?.('error');
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
        this.finishProcessing();
        return;
      }
      
      // 解析数据
      const parsedContent = this.parseSSEData(data);
      if (parsedContent) {
        // 添加到消息队列
        this.messageQueue.push({
          content: parsedContent,
          timestamp: Date.now()
        });
        
        // 启动队列处理
        this.processMessageQueue();
      }
    } catch (error) {
      console.error('❌ 处理SSE消息失败:', error);
      this.options.onError(error as Error);
    }
  }

  /**
   * 处理消息队列（打字机效果）
   */
  private processMessageQueue(): void {
    if (this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    const processNext = () => {
      if (this.messageQueue.length === 0) {
        this.isProcessingQueue = false;
        return;
      }
      
      // 取出队列中的消息
      const queueItem = this.messageQueue.shift();
      if (!queueItem) {
        this.isProcessingQueue = false;
        return;
      }
      
      // 拆分内容为字符
      const chars = queueItem.content.split('');
      let charIndex = 0;
      
      const typeNextBatch = () => {
        if (charIndex >= chars.length) {
          // 当前消息处理完成，处理下一个
          this.typewriterTimer = setTimeout(processNext, this.TYPEWRITER_DELAY);
          return;
        }
        
        // 处理一批字符
        let batch = '';
        for (let i = 0; i < this.BATCH_SIZE && charIndex < chars.length; i++) {
          batch += chars[charIndex++];
        }
        
        // 更新累积内容
        this.fullContent += batch;
        
        // 通知UI更新
        this.options.onMessage(batch);
        
        // 继续处理下一批
        this.typewriterTimer = setTimeout(typeNextBatch, this.TYPEWRITER_DELAY);
      };
      
      typeNextBatch();
    };
    
    processNext();
  }

  /**
   * 完成处理
   */
  private finishProcessing(): void {
    // 清理打字机定时器
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    
    // 立即处理剩余队列
    while (this.messageQueue.length > 0) {
      const queueItem = this.messageQueue.shift();
      if (queueItem) {
        this.fullContent += queueItem.content;
        this.options.onMessage(queueItem.content);
      }
    }
    
    this.isProcessingQueue = false;
    
    // 触发完成回调
    this.options.onComplete(this.fullContent);
    
    // 关闭连接
    this.closeConnection();
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
        this.finishProcessing();
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
    
    // 清理打字机定时器
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    
    // 重置状态
    this.isConnected = false;
    this.isProcessingQueue = false;
    this.messageQueue = [];
    
    this.options.onStatusChange?.('disconnected');
  }

  /**
   * 获取当前累积内容
   */
  getCurrentContent(): string {
    return this.fullContent;
  }

  /**
   * 获取连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessingQueue
    };
  }
}