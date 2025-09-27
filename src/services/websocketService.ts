/**
 * WebSocket服务 - 用于实时语音转录
 * 基于后端WebSocket接口文档实现
 */

export interface WebSocketMessage {
  type: 'transcription' | 'notification' | 'error' | 'message';
  data: any;
  userId?: string;
}

export interface TranscriptionResult {
  result: string;
  isFinal: boolean;
  timestamp?: number;
}

export interface WebSocketCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onTranscription: (result: TranscriptionResult) => void;
  onError: (error: string) => void;
  onMessage: (message: any) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private userId: string | null = null;
  private wsUrl: string;

  constructor(baseUrl: string = 'ws://localhost:8080') {
    this.wsUrl = `${baseUrl}/api/xunzhi/v1/xunfei/audio-to-text`;
  }

  /**
   * 连接WebSocket
   */
  connect(userId: string, callbacks: WebSocketCallbacks): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.callbacks = callbacks;
        
        // 构建WebSocket URL，包含用户ID
        const wsUrl = `${this.wsUrl}/${encodeURIComponent(userId)}`;
        console.log('🔌 连接WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.callbacks?.onConnect();
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket错误:', error);
          this.callbacks?.onError('WebSocket连接错误');
          if (!this.isConnected) {
            reject(error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket连接关闭:', event.code, event.reason);
          this.isConnected = false;
          this.callbacks?.onDisconnect();
          
          // 如果不是正常关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
        
      } catch (error) {
        console.error('🔌 WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      console.log('📨 收到WebSocket消息:', message);
      
      switch (message.type) {
        case 'transcription':
          this.callbacks?.onTranscription({
            result: message.result,
            isFinal: message.isFinal,
            timestamp: Date.now()
          });
          break;
          
        case 'error':
          this.callbacks?.onError(message.errorMessage || '未知错误');
          break;
          
        case 'notification':
          this.callbacks?.onMessage(message.message);
          break;
          
        default:
          this.callbacks?.onMessage(message);
      }
      
    } catch (error) {
      console.error('📨 解析WebSocket消息失败:', error);
      this.callbacks?.onError('消息解析失败');
    }
  }

  /**
   * 发送音频数据
   */
  sendAudioData(audioData: ArrayBuffer): boolean {
    if (!this.isConnected || !this.ws) {
      console.warn('🎤 WebSocket未连接，无法发送音频数据');
      return false;
    }
    
    try {
      this.ws.send(audioData);
      return true;
    } catch (error) {
      console.error('🎤 发送音频数据失败:', error);
      this.callbacks?.onError('发送音频数据失败');
      return false;
    }
  }

  /**
   * 发送文本消息
   */
  sendMessage(type: string, message: string, data?: any): boolean {
    if (!this.isConnected || !this.ws || !this.userId) {
      console.warn('📤 WebSocket未连接，无法发送消息');
      return false;
    }
    
    try {
      const payload = {
        userId: this.userId,
        type,
        message,
        data: data || null
      };
      
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('📤 发送消息失败:', error);
      this.callbacks?.onError('发送消息失败');
      return false;
    }
  }

  /**
   * 发送结束信号
   */
  sendEndSignal(): boolean {
    if (!this.isConnected || !this.ws) {
      return false;
    }
    
    try {
      // 发送空的ArrayBuffer表示音频流结束
      const endBuffer = new ArrayBuffer(0);
      this.ws.send(endBuffer);
      console.log('🔚 发送音频结束信号');
      return true;
    } catch (error) {
      console.error('🔚 发送结束信号失败:', error);
      return false;
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔄 达到最大重连次数，停止重连');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 ${delay}ms后尝试第${this.reconnectAttempts}次重连...`);
    
    setTimeout(() => {
      if (this.userId && this.callbacks) {
        this.connect(this.userId, this.callbacks).catch(error => {
          console.error('🔄 重连失败:', error);
        });
      }
    }, delay);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.isConnected = false;
    this.callbacks = null;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * 检查连接状态
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

// 创建单例实例
export const websocketService = new WebSocketService();