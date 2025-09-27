import { useState, useRef, useCallback } from 'react';
import { xunfeiSpeechService, SpeechToTextResult } from '../services/xunfeiSpeechService';
import { AudioConverter } from '../utils/audioConverter';

export interface AudioRecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  audioBlob: Blob | null;
  duration: number;
}

export interface UseAudioRecorderReturn {
  state: AudioRecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  convertToText: () => Promise<SpeechToTextResult>;
  clearRecording: () => void;
  resetError: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    audioBlob: null,
    duration: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const stateRef = useRef<AudioRecorderState>(state);

  // 更新stateRef以保持最新状态
  stateRef.current = state;

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      // 重置状态
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        error: null,
        audioBlob: null,
        duration: 0,
      }));

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // 讯飞推荐的采样率
        },
      });

      // 检查浏览器支持的音频格式，优先使用WAV格式
      const mimeTypes = [
        'audio/wav',
        'audio/webm;codecs=pcm',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('🎤 选择的音频格式:', selectedMimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('浏览器不支持任何音频录制格式');
      }

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // 设置事件监听器
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 收到音频数据:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('🎤 当前音频块总数:', audioChunksRef.current.length);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🎤 MediaRecorder onstop 事件触发');
        console.log('🎤 音频块数量:', audioChunksRef.current.length);
        console.log('🎤 音频块详情:', audioChunksRef.current.map(chunk => ({ size: chunk.size, type: chunk.type })));
        
        if (audioChunksRef.current.length === 0) {
          console.error('🎤 没有收集到任何音频数据');
          setState(prev => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            error: '没有录制到音频数据，请检查麦克风权限',
          }));
          return;
        }

        const originalBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });
        const duration = Date.now() - startTimeRef.current;

        console.log('🎤 创建的原始 audioBlob:', {
          size: originalBlob.size,
          type: originalBlob.type,
          duration
        });

        if (originalBlob.size === 0) {
          console.error('🎤 创建的音频Blob大小为0');
          setState(prev => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            error: '录制的音频文件为空',
          }));
          return;
        }

        try {
          let finalAudioBlob = originalBlob;

          // 如果不是WAV格式，尝试转换为WAV
          if (!selectedMimeType.includes('wav') && AudioConverter.isSupported()) {
            console.log('🎤 开始转换音频格式到WAV...');
            setState(prev => ({
              ...prev,
              isProcessing: true,
            }));

            try {
              finalAudioBlob = await AudioConverter.webmToWav(originalBlob);
              console.log('🎤 音频格式转换成功:', {
                originalSize: originalBlob.size,
                originalType: originalBlob.type,
                convertedSize: finalAudioBlob.size,
                convertedType: finalAudioBlob.type
              });
            } catch (convertError) {
              console.warn('🎤 音频格式转换失败，使用原始格式:', convertError);
              finalAudioBlob = originalBlob;
            }
          }

          setState(prev => {
            console.log('🎤 更新状态，设置 audioBlob');
            console.log('🎤 prev状态:', prev);
            console.log('🎤 要设置的audioBlob:', finalAudioBlob);
            const newState = {
              ...prev,
              isRecording: false,
              isProcessing: false,
              audioBlob: finalAudioBlob,
              duration,
            };
            console.log('🎤 新状态:', newState);
            
            // 同时更新 stateRef
            stateRef.current = newState;
            console.log('🎤 已更新 stateRef.current:', stateRef.current);
            
            return newState;
          });

        } catch (error) {
          console.error('🎤 处理音频时发生错误:', error);
          setState(prev => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            error: '音频处理失败',
          }));
        }

        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
        console.log('🎤 已停止所有音频轨道');
      };

      mediaRecorder.onerror = (event) => {
        console.error('录音错误:', event);
        setState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
          error: '录音过程中发生错误',
        }));

        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      // 开始录音
      mediaRecorder.start(100); // 每100ms收集一次数据
      console.log('🎤 MediaRecorder 已开始录音，timeslice: 100ms');

      setState(prev => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
        error: null,
      }));

      console.log('🎤 录音状态已更新为 isRecording: true');

    } catch (error) {
      console.error('开始录音失败:', error);
      let errorMessage = '开始录音失败';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = '请允许访问麦克风权限';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '未找到麦克风设备';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = '浏览器不支持录音功能';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(async () => {
    console.log('🎤 stopRecording 被调用，当前状态:', {
      isRecording: stateRef.current.isRecording,
      mediaRecorder: !!mediaRecorderRef.current,
      mediaRecorderState: mediaRecorderRef.current?.state
    });
    
    if (mediaRecorderRef.current && stateRef.current.isRecording) {
      console.log('🎤 开始停止录音...');
      setState(prev => ({
        ...prev,
        isProcessing: true,
      }));

      mediaRecorderRef.current.stop();
      console.log('🎤 已调用 mediaRecorder.stop()');
    } else {
      console.log('🎤 无法停止录音 - mediaRecorder 或 isRecording 状态不正确', {
        hasMediaRecorder: !!mediaRecorderRef.current,
        isRecording: stateRef.current.isRecording,
        mediaRecorderState: mediaRecorderRef.current?.state
      });
    }
  }, []);

  // 转换为文字
  const convertToText = useCallback(async (): Promise<SpeechToTextResult> => {
    console.log('🎤 convertToText被调用，当前状态:', state);
    console.log('🎤 convertToText被调用，stateRef状态:', stateRef.current);
    
    // 等待audioBlob准备就绪
    const maxWaitTime = 3000; // 最长等待3秒
    const checkInterval = 100; // 每100ms检查一次
    let waitedTime = 0;

    while (waitedTime < maxWaitTime && !stateRef.current.audioBlob) {
      console.log('🎤 等待audioBlob准备就绪...', { 
        waitedTime, 
        hasAudioBlob: !!stateRef.current.audioBlob,
        audioBlobSize: stateRef.current.audioBlob?.size || 0
      });
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waitedTime += checkInterval;
    }

    if (!stateRef.current.audioBlob) {
      console.error('🎤 convertToText: audioBlob仍然为null');
      return {
        success: false,
        text: '',
        error: '没有可转换的音频文件',
      };
    }

    console.log('🎤 audioBlob准备就绪，开始转换:', {
      size: stateRef.current.audioBlob.size,
      type: stateRef.current.audioBlob.type
    });

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
      }));

      // 验证音频文件
      const validation = xunfeiSpeechService.validateAudioFile(stateRef.current.audioBlob);
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: validation.error || '音频文件验证失败',
        }));

        return {
          success: false,
          text: '',
          error: validation.error || '音频文件验证失败',
        };
      }

      // 调用讯飞语音转文字服务
      const result = await xunfeiSpeechService.audioToText(stateRef.current.audioBlob);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: result.success ? null : result.error || '转换失败',
      }));

      return result;

    } catch (error) {
      console.error('语音转文字失败:', error);
      const errorMessage = error instanceof Error ? error.message : '转换过程中发生错误';

      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      return {
        success: false,
        text: '',
        error: errorMessage,
      };
    }
  }, [state.audioBlob]);

  // 清除录音
  const clearRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      duration: 0,
      error: null,
    }));
    audioChunksRef.current = [];
  }, []);

  // 重置错误
  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    convertToText,
    clearRecording,
    resetError,
  };
};