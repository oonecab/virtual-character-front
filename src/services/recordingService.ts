// 录音服务 - 处理语音录音和转换
export interface RecordingConfig {
  audioTrackConstraints?: MediaTrackConstraints;
  downloadOnSavePress?: boolean;
  downloadFileExtension?: string;
  showVisualizer?: boolean;
}

export interface RecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  format: string;
}

export interface SpeechToTextResult {
  text: string;
  confidence: number;
  language: string;
}

class RecordingService {
  private isRecording: boolean = false;
  private currentRecording: Blob | null = null;
  private recognitionService: any = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  /**
   * 初始化语音识别服务
   */
  private initializeSpeechRecognition(): void {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined' && 
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognitionService = new SpeechRecognition();
      this.recognitionService.continuous = false;
      this.recognitionService.interimResults = true;
      this.recognitionService.lang = 'zh-CN';
    }
  }

  /**
   * 处理录音完成事件
   */
  handleRecordingComplete = (audioBlob: Blob): RecordingResult => {
    this.currentRecording = audioBlob;
    // 检查是否在浏览器环境中
    const audioUrl = typeof window !== 'undefined' ? URL.createObjectURL(audioBlob) : '';
    
    return {
      audioBlob,
      audioUrl,
      duration: 0, // 实际项目中可以计算音频时长
      format: 'webm'
    };
  };

  /**
   * 将录音转换为文本（使用语音识别）
   */
  async convertSpeechToText(audioBlob: Blob): Promise<SpeechToTextResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognitionService) {
        reject(new Error('浏览器不支持语音识别'));
        return;
      }

      // 注意：Web Speech API 不能直接处理 Blob，需要实时录音
      // 这里提供一个备用方案，实际使用时建议直接使用语音识别
      resolve({
        text: '语音转文字功能需要实时录音，请使用麦克风按钮进行语音输入',
        confidence: 0.8,
        language: 'zh-CN'
      });
    });
  }

  /**
   * 开始语音识别（实时）
   */
  startSpeechRecognition(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognitionService) {
        reject(new Error('浏览器不支持语音识别'));
        return;
      }

      let finalTranscript = '';

      this.recognitionService.onstart = () => {
        console.log('语音识别开始');
      };

      this.recognitionService.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognitionService.onend = () => {
        console.log('语音识别结束');
        resolve(finalTranscript || '未识别到语音内容');
      };

      this.recognitionService.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        reject(new Error(`语音识别失败: ${event.error}`));
      };

      this.recognitionService.start();
    });
  }

  /**
   * 停止语音识别
   */
  stopSpeechRecognition(): void {
    if (this.recognitionService) {
      this.recognitionService.stop();
    }
  }

  /**
   * 获取录音状态
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * 设置录音状态
   */
  setRecordingStatus(status: boolean): void {
    this.isRecording = status;
  }

  /**
   * 获取当前录音
   */
  getCurrentRecording(): Blob | null {
    return this.currentRecording;
  }

  /**
   * 清除当前录音
   */
  clearCurrentRecording(): void {
    if (this.currentRecording && typeof window !== 'undefined') {
      URL.revokeObjectURL(URL.createObjectURL(this.currentRecording));
    }
    this.currentRecording = null;
  }

  /**
   * 上传录音到服务器（模拟）
   */
  async uploadRecording(audioBlob: Blob, sessionId: string): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
  }> {
    try {
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功响应
      return {
        success: true,
        audioUrl: `https://api.example.com/audio/${sessionId}/${Date.now()}.webm`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      };
    }
  }

  /**
   * 获取默认录音配置
   */
  getDefaultConfig(): RecordingConfig {
    return {
      audioTrackConstraints: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        sampleRate: 44100
      },
      downloadOnSavePress: false,
      downloadFileExtension: 'webm',
      showVisualizer: true
    };
  }
}

// 导出单例实例
export const recordingService = new RecordingService();

// 导出类型
export type { RecordingConfig, RecordingResult, SpeechToTextResult };