import { useState, useRef, useCallback } from 'react';
import { ttsService, TTSRequest } from '@/services/ttsService';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentText: string | null;
}

export interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  playText: (text: string, options?: Partial<TTSRequest>, agentName?: string) => Promise<void>;
  stopAudio: () => void;
  clearError: () => void;
}

/**
 * 音频播放管理器钩子
 * 用于管理TTS音频播放状态和控制
 */
export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentText: null,
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  /**
   * 停止当前播放的音频
   */
  const stopAudio = useCallback(() => {
    console.log('🔊 [useAudioPlayer] 停止音频播放');
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      currentText: null,
    }));
  }, []);

  /**
   * 播放文本语音
   */
  const playText = useCallback(async (text: string, options: Partial<TTSRequest> = {}, agentName?: string) => {
    try {
      console.log('🔊 [useAudioPlayer] 开始播放文本:', text.substring(0, 50) + '...', '| Agent:', agentName);

      // 停止当前播放的音频
      stopAudio();

      // 设置加载状态
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        currentText: text,
      }));

      // 验证文本
      const validation = ttsService.validateText(text);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 调用TTS服务，传递Agent名称
      const ttsResult = await ttsService.textToSpeech(text, options, agentName);

      if (!ttsResult.success || !ttsResult.audioUrl) {
        throw new Error(ttsResult.error || 'TTS转换失败');
      }

      console.log('🔊 [useAudioPlayer] TTS转换成功，开始播放音频，音色:', ttsResult.voiceType);

      // 创建音频元素
      const audio = new Audio(ttsResult.audioUrl);
      currentAudioRef.current = audio;
      currentAudioUrlRef.current = ttsResult.audioUrl;

      // 设置音频事件监听器
      audio.onloadeddata = () => {
        console.log('🔊 [useAudioPlayer] 音频数据加载完成');
        setState(prev => ({
          ...prev,
          isLoading: false,
          isPlaying: true,
        }));
      };

      audio.onplay = () => {
        console.log('🔊 [useAudioPlayer] 音频开始播放');
        setState(prev => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
        }));
      };

      audio.onpause = () => {
        console.log('🔊 [useAudioPlayer] 音频暂停');
        setState(prev => ({
          ...prev,
          isPlaying: false,
        }));
      };

      audio.onended = () => {
        console.log('🔊 [useAudioPlayer] 音频播放完成');
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentText: null,
        }));
        
        // 清理资源
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
          currentAudioUrlRef.current = null;
        }
        currentAudioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error('🔊 [useAudioPlayer] 音频播放失败:', error);
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isLoading: false,
          error: '音频播放失败',
          currentText: null,
        }));
        
        // 清理资源
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
          currentAudioUrlRef.current = null;
        }
        currentAudioRef.current = null;
      };

      // 开始播放
      await audio.play();

    } catch (error) {
      console.error('🔊 [useAudioPlayer] 播放文本失败:', error);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '播放失败',
        currentText: null,
      }));
      
      // 清理资源
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
      currentAudioRef.current = null;
    }
  }, [stopAudio]);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    playText,
    stopAudio,
    clearError,
  };
};