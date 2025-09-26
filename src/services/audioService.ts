// 音频服务 - 处理AI回复的音频播放
export interface AudioConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface AudioResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  /**
   * 使用浏览器语音合成API播放文本
   */
  async playTextWithSpeechSynthesis(
    text: string, 
    config: AudioConfig = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('浏览器不支持语音合成'));
        return;
      }

      // 停止当前播放
      this.stopCurrentAudio();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = config.rate || 0.9;
      utterance.pitch = config.pitch || 1;
      utterance.volume = config.volume || 1;

      // 设置语音
      if (config.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name.includes(config.voice!) || voice.lang.includes('zh')
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        console.log('🔊 开始播放语音');
      };

      utterance.onend = () => {
        this.isPlaying = false;
        console.log('🔊 语音播放完成');
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        console.error('🔊 语音播放错误:', event.error);
        reject(new Error(`语音播放失败: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * 调用后端API生成并播放音频（测试版本）
   */
  async playTextWithBackendAPI(
    text: string, 
    sessionId: string,
    config: AudioConfig = {}
  ): Promise<void> {
    try {
      console.log('🔊 调用后端API生成音频:', { text, sessionId, config });
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里后续替换为真实的API调用
      const mockResponse: AudioResponse = {
        audioUrl: `data:audio/wav;base64,mock_audio_data_${Date.now()}`,
        duration: Math.floor(text.length * 0.1), // 模拟音频时长
        format: 'wav'
      };

      // 模拟播放音频文件
      console.log('🔊 模拟播放音频文件:', mockResponse);
      
      // 实际实现中这里会播放真实的音频文件
      // await this.playAudioFile(mockResponse.audioUrl);
      
      // 暂时使用语音合成作为fallback
      await this.playTextWithSpeechSynthesis(text, config);
      
    } catch (error) {
      console.error('🔊 后端音频API调用失败:', error);
      // fallback到浏览器语音合成
      await this.playTextWithSpeechSynthesis(text, config);
    }
  }

  /**
   * 播放音频文件
   */
  async playAudioFile(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopCurrentAudio();

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onloadstart = () => {
        console.log('🔊 开始加载音频文件');
      };

      audio.oncanplay = () => {
        console.log('🔊 音频文件可以播放');
      };

      audio.onplay = () => {
        this.isPlaying = true;
        console.log('🔊 开始播放音频文件');
      };

      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        console.log('🔊 音频文件播放完成');
        resolve();
      };

      audio.onerror = (event) => {
        this.isPlaying = false;
        this.currentAudio = null;
        console.error('🔊 音频文件播放错误:', event);
        reject(new Error('音频文件播放失败'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * 停止当前播放的音频
   */
  stopCurrentAudio(): void {
    // 停止语音合成
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // 停止音频文件播放
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.isPlaying = false;
    console.log('🔊 停止音频播放');
  }

  /**
   * 获取当前播放状态
   */
  getPlayingStatus(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取可用的语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return speechSynthesis.getVoices();
  }

  /**
   * 获取中文语音列表
   */
  getChineseVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.includes('zh') || voice.lang.includes('cn')
    );
  }
}

// 导出单例实例
export const audioService = new AudioService();

// 后端API接口定义（待实现）
export interface BackendAudioAPI {
  /**
   * 文本转语音
   */
  textToSpeech(params: {
    text: string;
    sessionId: string;
    voice?: string;
    rate?: number;
    pitch?: number;
  }): Promise<AudioResponse>;

  /**
   * 获取支持的语音列表
   */
  getVoices(): Promise<{
    voices: Array<{
      id: string;
      name: string;
      language: string;
      gender: 'male' | 'female';
    }>;
  }>;
}

// 测试数据和模拟接口
export const mockAudioAPI: BackendAudioAPI = {
  async textToSpeech(params) {
    console.log('🔊 模拟后端API调用:', params);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    return {
      audioUrl: `https://mock-api.example.com/audio/${Date.now()}.wav`,
      duration: Math.floor(params.text.length * 0.08), // 模拟音频时长
      format: 'wav'
    };
  },

  async getVoices() {
    return {
      voices: [
        { id: 'zh-cn-female-1', name: '小雅', language: 'zh-CN', gender: 'female' },
        { id: 'zh-cn-male-1', name: '小明', language: 'zh-CN', gender: 'male' },
        { id: 'zh-cn-female-2', name: '小美', language: 'zh-CN', gender: 'female' },
      ]
    };
  }
};