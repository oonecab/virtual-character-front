// 后端实时语音转写服务
import { request } from '@/utils/request';

export interface BackendSpeechResponse {
  success: boolean;
  text?: string;
  error?: string;
  isEnd?: boolean;
}

export interface XunfeiSpeechToTextResponse {
  code: string;
  message: string | null;
  data: {
    success: boolean;
    transcriptionText: string;
    audioDuration: number | null;
    audioFileSize: number;
    audioFormat: string;
    transcriptionStartTime: number;
    transcriptionEndTime: number;
    transcriptionDuration: number;
    confidence: number | null;
    language: string;
    errorMessage: string | null;
    requestId: string;
    originalFileName: string;
  };
  requestId: string | null;
  success: boolean;
}

export interface SpeechToTextResult {
  success: boolean;
  text: string;
  error?: string;
  requestId?: string;
}

export interface RealtimeTranscriptionResult {
  success: boolean;
  text: string;
  error?: string;
  isEnd?: boolean;
}

export interface RealtimeTranscriptionCallbacks {
  onResult: (result: RealtimeTranscriptionResult) => void;
  onError: (error: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * 后端WebSocket语音转写服务
 */
class BackendSpeechService {
  private wsUrl = 'ws://localhost:8080/api/xunzhi/v1/xunfei/audio-to-text';
  private websocket: WebSocket | null = null;
  private callbacks: RealtimeTranscriptionCallbacks | null = null;
  private isConnected: boolean = false;

  /**
   * 建立WebSocket连接
   */
  async connect(callbacks: RealtimeTranscriptionCallbacks): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.callbacks = callbacks;
        
        console.log('🎤 连接后端WebSocket:', this.wsUrl);
        
        this.websocket = new WebSocket(this.wsUrl);
        
        this.websocket.onopen = () => {
          console.log('🎤 WebSocket连接成功');
          this.isConnected = true;
          callbacks.onConnect();
          resolve(true);
        };
        
        this.websocket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.websocket.onerror = (error) => {
          console.error('🎤 WebSocket错误:', error);
          this.isConnected = false;
          callbacks.onError('WebSocket连接错误');
          reject(error);
        };
        
        this.websocket.onclose = (event) => {
          console.log('🎤 WebSocket连接关闭:', event.code, event.reason);
          this.isConnected = false;
          callbacks.onDisconnect();
        };
        
      } catch (error) {
        console.error('🎤 连接失败:', error);
        callbacks.onError('连接失败: ' + error);
        reject(error);
      }
    });
  }

  /**
   * 处理WebSocket消息
   */
  private handleMessage(data: string): void {
    try {
      const response: BackendSpeechResponse = JSON.parse(data);
      console.log('🎤 收到后端消息:', response);
      
      if (!response.success) {
        this.callbacks?.onError(response.error || '转写失败');
        return;
      }
      
      this.callbacks?.onResult({
        success: true,
        text: response.text || '',
        isEnd: response.isEnd || false
      });
      
    } catch (error) {
      console.error('🎤 解析消息失败:', error);
      this.callbacks?.onError('解析消息失败');
    }
  }

  /**
   * 发送音频数据
   */
  sendAudioData(audioData: ArrayBuffer): void {
    if (!this.isConnected || !this.websocket) {
      console.warn('🎤 WebSocket未连接，无法发送音频数据');
      return;
    }
    
    try {
      // 直接发送二进制音频数据
      this.websocket.send(audioData);
    } catch (error) {
      console.error('🎤 发送音频数据失败:', error);
      this.callbacks?.onError('发送音频数据失败');
    }
  }

  /**
   * 发送结束标识
   */
  sendEndSignal(): void {
    if (!this.isConnected || !this.websocket) {
      return;
    }
    
    try {
      // 发送空的ArrayBuffer表示结束
      const endBuffer = new ArrayBuffer(0);
      this.websocket.send(endBuffer);
      console.log('🎤 发送结束标识');
    } catch (error) {
      console.error('🎤 发送结束标识失败:', error);
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close(1000, 'Normal closure');
      this.websocket = null;
    }
    this.isConnected = false;
    this.callbacks = null;
  }

  /**
   * 检查连接状态
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.websocket?.readyState === WebSocket.OPEN;
  }
}

// 导出实例
export const backendSpeechService = new BackendSpeechService();

// 保留原有的同步接口作为备用
class XunfeiSpeechService {
  private readonly baseUrl = '/api/xunzhi/v1/xunfei';

  /**
   * 将音频文件转换为文字
   * @param audioFile 音频文件 (Blob)
   * @returns Promise<SpeechToTextResult>
   */
  async audioToText(audioFile: Blob): Promise<SpeechToTextResult> {
    try {
      console.log('🎤 [xunfeiSpeechService] 开始语音转文字请求:', {
        fileSize: audioFile.size,
        fileType: audioFile.type,
        url: `${this.baseUrl}/audio-transcribe`
      });

      // 创建 FormData 对象
      const formData = new FormData();
      
      // 根据音频类型设置文件名
      let fileName = 'audio.webm';
      if (audioFile.type.includes('wav')) {
        fileName = 'audio.wav';
      } else if (audioFile.type.includes('mp3')) {
        fileName = 'audio.mp3';
      } else if (audioFile.type.includes('ogg')) {
        fileName = 'audio.ogg';
      } else if (audioFile.type.includes('m4a')) {
        fileName = 'audio.m4a';
      }
      
      formData.append('file', audioFile, fileName);
      console.log('🎤 [xunfeiSpeechService] FormData准备完成, fileName:', fileName);

      // 发送请求到讯飞接口 - 使用项目的request实例确保自动带上token
      console.log('🎤 [xunfeiSpeechService] 发送API请求...');
      const response = await request.post<XunfeiSpeechToTextResponse>(
        '/xunzhi/v1/xunfei/audio-transcribe',
        formData,
        {
          headers: {
            // 让浏览器自动设置 Content-Type 为 multipart/form-data
            'Content-Type': undefined,
          },
        }
      );

      console.log('🎤 [xunfeiSpeechService] API响应数据:', response);

      // 检查响应状态
      if (!response.success || response.code !== '0') {
        console.error('🎤 [xunfeiSpeechService] API返回错误:', response);
        return {
          success: false,
          text: '',
          error: response.data?.errorMessage || response.message || '语音转文字失败',
          requestId: response.data?.requestId || response.requestId
        };
      }

      // 检查内部数据状态
      if (!response.data?.success) {
        console.error('🎤 [xunfeiSpeechService] 转写失败:', response.data);
        return {
          success: false,
          text: '',
          error: response.data?.errorMessage || '语音转文字失败',
          requestId: response.data?.requestId
        };
      }

      // 提取转换后的文字
      const text = response.data.transcriptionText || '';
      console.log('🎤 [xunfeiSpeechService] 转换成功, 文字内容:', text);
      console.log('🎤 [xunfeiSpeechService] 转换详情:', {
        audioFileSize: response.data.audioFileSize,
        audioFormat: response.data.audioFormat,
        transcriptionDuration: response.data.transcriptionDuration,
        language: response.data.language,
        confidence: response.data.confidence
      });

      return {
        success: true,
        text: text || '未识别到语音内容',
        requestId: response.data.requestId
      };

    } catch (error) {
      console.error('🎤 [xunfeiSpeechService] 讯飞语音转文字服务错误:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }

  /**
   * 检查音频文件格式是否支持
   * @param file 音频文件
   * @returns boolean
   */
  isSupportedAudioFormat(file: Blob): boolean {
    const supportedTypes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/ogg',
      'audio/m4a'
    ];

    return supportedTypes.includes(file.type);
  }

  /**
   * 获取音频文件大小限制（字节）
   * @returns number
   */
  getMaxFileSize(): number {
    // 设置最大文件大小为 10MB
    return 10 * 1024 * 1024;
  }

  /**
   * 验证音频文件
   * @param file 音频文件
   * @returns { valid: boolean, error?: string }
   */
  validateAudioFile(file: Blob): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: '音频文件不能为空' };
    }

    if (file.size === 0) {
      return { valid: false, error: '音频文件大小不能为0' };
    }

    if (file.size > this.getMaxFileSize()) {
      return { valid: false, error: '音频文件大小超过限制（最大10MB）' };
    }

    if (!this.isSupportedAudioFormat(file)) {
      return { valid: false, error: '不支持的音频格式' };
    }

    return { valid: true };
  }
}

// 导出XunfeiSpeechService实例
export const xunfeiSpeechService = new XunfeiSpeechService();