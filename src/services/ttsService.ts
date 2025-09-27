import { request } from '@/utils/request';

export interface TTSRequest {
  text: string;
  voiceType?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  audioFormat?: string;
  sampleRate?: number;
  sessionId?: string;
  userId?: number;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  error?: string;
  requestId?: string;
}

export interface TTSServiceOptions {
  baseUrl?: string;
  defaultVoiceType?: string;
  defaultSpeed?: number;
  defaultPitch?: number;
  defaultVolume?: number;
  defaultAudioFormat?: string;
  defaultSampleRate?: number;
}

/**
 * TTS 文本转语音服务
 * 基于 AI角色扮演接口 /api/xunzhi/v1/ai/roleplay/tts/synthesis/stream
 */
class TTSService {
  private readonly baseUrl: string;
  private readonly defaultOptions: Required<Omit<TTSServiceOptions, 'baseUrl'>>;

  constructor(options: TTSServiceOptions = {}) {
    this.baseUrl = options.baseUrl || '/api/xunzhi/v1/ai/roleplay';
    this.defaultOptions = {
      defaultVoiceType: options.defaultVoiceType || 'S_8Qio6qDE1', // 默认使用火麟飞音色
      defaultSpeed: options.defaultSpeed || 1.0,
      defaultPitch: options.defaultPitch || 1.0,
      defaultVolume: options.defaultVolume || 1.0,
      defaultAudioFormat: options.defaultAudioFormat || 'mp3',
      defaultSampleRate: options.defaultSampleRate || 16000,
    };
  }

  /**
   * 根据Agent名称获取对应的音色ID
   * @param agentName Agent名称
   * @returns 音色ID
   */
  private getVoiceTypeByAgentName(agentName?: string): string {
    if (!agentName) {
      return 'S_8Qio6qDE1'; // 默认火麟飞音色
    }

    // 根据Agent名称匹配音色ID
    const voiceMap: Record<string, string> = {
      '火麟飞': 'S_8Qio6qDE1',
      '喜羊羊': 'S_TDj8b7Az1'
    };

    // 精确匹配
    if (voiceMap[agentName]) {
      return voiceMap[agentName];
    }

    // 模糊匹配（包含关键词）
    for (const [name, voiceId] of Object.entries(voiceMap)) {
      if (agentName.includes(name)) {
        return voiceId;
      }
    }

    // 默认返回火麟飞音色
    return 'S_8Qio6qDE1';
  }

  /**
   * 文本转语音
   * @param text 要转换的文本
   * @param options 可选的TTS参数
   * @param agentName Agent名称，用于选择音色
   * @returns Promise<TTSResponse>
   */
  async textToSpeech(text: string, options: Partial<TTSRequest> = {}, agentName?: string): Promise<TTSResponse> {
    try {
      console.log('🔊 [TTSService] 开始TTS转换');
      console.log('🔊 [TTSService] 文本内容:', text.substring(0, 100) + '...');
      console.log('🔊 [TTSService] Agent名称:', agentName);
      
      // 验证文本内容
      if (!text || text.trim().length === 0) {
        console.error('🔊 [TTSService] 文本内容为空');
        return {
          success: false,
          error: '文本内容不能为空'
        };
      }

      // 根据Agent名称选择音色
      const voiceType = this.getVoiceTypeByAgentName(agentName);
      console.log('🔊 [TTSService] 选择的音色ID:', voiceType);

      // 准备请求参数
      const requestData: TTSRequest = {
        text: text.trim(),
        voiceType: options.voiceType || voiceType,
        speed: options.speed || this.defaultOptions.defaultSpeed,
        pitch: options.pitch || this.defaultOptions.defaultPitch,
        volume: options.volume || this.defaultOptions.defaultVolume,
        audioFormat: options.audioFormat || this.defaultOptions.defaultAudioFormat,
        sampleRate: options.sampleRate || this.defaultOptions.defaultSampleRate,
        sessionId: options.sessionId,
        userId: options.userId,
      };

      console.log('🔊 [TTSService] 请求参数:', requestData);

      // 发送请求到TTS接口
      const response = await fetch(`${this.baseUrl}/tts/synthesis/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('🔊 [TTSService] 响应状态:', response.status);
      console.log('🔊 [TTSService] 响应头:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔊 [TTSService] HTTP错误:', response.status, errorText);
        return {
          success: false,
          error: `HTTP错误: ${response.status} - ${errorText}`
        };
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      console.log('🔊 [TTSService] 响应内容类型:', contentType);

      if (contentType && contentType.includes('audio')) {
        // 直接返回音频流
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('🔊 [TTSService] 音频文件创建成功:', {
          blobSize: audioBlob.size,
          blobType: audioBlob.type,
          audioUrl
        });

        return {
          success: true,
          audioUrl,
          audioBlob,
        };
      } else {
        // 可能返回错误信息的JSON
        try {
          const errorData = await response.json();
          console.error('🔊 [TTSService] TTS API返回错误:', errorData);
          return {
            success: false,
            error: errorData.message || 'TTS转换失败'
          };
        } catch (parseError) {
          console.error('🔊 [TTSService] 解析错误响应失败:', parseError);
          return {
            success: false,
            error: 'TTS服务响应格式错误'
          };
        }
      }

    } catch (error) {
      console.error('🔊 [TTSService] TTS服务错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }

  /**
   * 播放音频
   * @param audioUrl 音频URL或Blob URL
   * @returns Promise<void>
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔊 [TTSService] 开始播放音频:', audioUrl);
        
        const audio = new Audio(audioUrl);
        
        audio.onloadeddata = () => {
          console.log('🔊 [TTSService] 音频数据加载完成');
        };
        
        audio.onplay = () => {
          console.log('🔊 [TTSService] 音频开始播放');
        };
        
        audio.onended = () => {
          console.log('🔊 [TTSService] 音频播放完成');
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('🔊 [TTSService] 音频播放失败:', error);
          reject(new Error('音频播放失败'));
        };
        
        audio.play().catch(error => {
          console.error('🔊 [TTSService] 音频播放启动失败:', error);
          reject(error);
        });
        
      } catch (error) {
        console.error('🔊 [TTSService] 播放音频时发生错误:', error);
        reject(error);
      }
    });
  }

  /**
   * 文本转语音并播放
   * @param text 要转换并播放的文本
   * @param options 转换选项
   * @returns Promise<void>
   */
  async speakText(text: string, options: Partial<TTSRequest> = {}): Promise<void> {
    try {
      console.log('🔊 [TTSService] 开始语音播报:', text.substring(0, 50) + '...');
      
      const ttsResult = await this.textToSpeech(text, options);
      
      if (!ttsResult.success || !ttsResult.audioUrl) {
        throw new Error(ttsResult.error || 'TTS转换失败');
      }
      
      await this.playAudio(ttsResult.audioUrl);
      
      // 清理Blob URL
      if (ttsResult.audioBlob && ttsResult.audioUrl) {
        URL.revokeObjectURL(ttsResult.audioUrl);
      }
      
    } catch (error) {
      console.error('🔊 [TTSService] 语音播报失败:', error);
      throw error;
    }
  }

  /**
   * 获取支持的语音类型
   * @returns Promise<string[]>
   */
  async getSupportedVoices(): Promise<string[]> {
    try {
      console.log('🔊 [TTSService] 获取支持的语音类型');
      
      const response = await request.get<{
        code: string;
        message: string;
        data: string[];
        requestId: string;
      }>('/xunzhi/v1/ai/roleplay/tts/voices');

      if (response.code === '0' && response.data) {
        console.log('🔊 [TTSService] 支持的语音类型:', response.data);
        return response.data;
      } else {
        console.error('🔊 [TTSService] 获取语音类型失败:', response);
        return ['xiaoyun', 'xiaogang', 'xiaomei']; // 返回默认语音类型
      }
    } catch (error) {
      console.error('🔊 [TTSService] 获取语音类型错误:', error);
      return ['xiaoyun', 'xiaogang', 'xiaomei']; // 返回默认语音类型
    }
  }

  /**
   * 验证文本是否适合TTS转换
   * @param text 要验证的文本
   * @returns 验证结果
   */
  validateText(text: string): { valid: boolean; error?: string } {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: '文本不能为空' };
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return { valid: false, error: '文本内容不能为空' };
    }

    if (trimmedText.length > 5000) {
      return { valid: false, error: '文本长度不能超过5000个字符' };
    }

    return { valid: true };
  }
}

// 创建默认实例
export const ttsService = new TTSService();

// 导出类以便自定义配置
export { TTSService };