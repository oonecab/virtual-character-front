import { useState, useCallback, useRef } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import type { UseAudioRecorderReturn } from './useAudioRecorder';

interface UseInputManagerProps {
  onSendMessage: (message: string) => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  audioRecorder: UseAudioRecorderReturn;
}

export interface UseInputManagerReturn {
  inputValue: string;
  isListening: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleMicrophoneClick: () => Promise<void>;
  clearInput: () => void;
  createNewSession: (message: string) => Promise<string | null>;
  audioRecorder: UseAudioRecorderReturn;
}

export const useInputManager = ({ 
  onSendMessage, 
  onRecordingComplete, 
  audioRecorder 
}: UseInputManagerProps): UseInputManagerReturn => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理输入框变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  // 清空输入框
  const clearInput = useCallback(() => {
    setInputValue('');
  }, []);

  // 创建新会话
  const createNewSession = useCallback(async (message: string): Promise<string | null> => {
    try {
      console.log('🆕 创建新会话，消息:', message);
      
      // 调用实际的API来创建会话
      const { AiChatService } = await import('../services/aiChatService');
      const session = await AiChatService.createSession(message, 1);
      
      if (session && session.sessionId) {
        console.log('✅ 会话创建成功，ID:', session.sessionId);
        return session.sessionId;
      } else {
        throw new Error('API返回的会话信息无效');
      }
    } catch (error) {
      console.error('❌ 创建会话失败:', error);
      Toast.error('创建会话失败，请重试');
      return null;
    }
  }, []);

  // 处理麦克风点击
  const handleMicrophoneClick = useCallback(async () => {
    console.log('🎤 handleMicrophoneClick 被调用, 当前状态:', {
      isListening,
      audioRecorderState: audioRecorder.state
    });

    if (isListening) {
      // 停止录音
      try {
        console.log('🎤 停止录音...');
        await audioRecorder.stopRecording();
        
        // 等待一小段时间确保状态更新完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🎤 录音停止完成, state.audioBlob:', audioRecorder.state.audioBlob);
        
        // 异步调用语音转文字，避免阻塞UI
        console.log('🎤 开始异步语音转文字...');
        audioRecorder.convertToText().then(result => {
          console.log('🎤 语音转文字结果:', result);
          
          if (result.success && result.text) {
            console.log('🎤 语音转文字成功:', result.text);
            setInputValue(prev => {
              const newValue = prev ? `${prev} ${result.text}` : result.text;
              console.log('🎤 设置输入框内容:', newValue);
              return newValue;
            });
            Toast.success('语音转换成功');
          } else {
            console.error('🎤 语音转换失败:', result.error);
            Toast.error('语音转换失败，请重试');
          }
        }).catch(error => {
          console.error('🎤 语音转文字异步调用失败:', error);
          Toast.error('语音转换失败，请重试');
        });
        
        setIsListening(false);
      } catch (error) {
        console.error('🎤 停止录音失败:', error);
        Toast.error('停止录音失败，请重试');
        setIsListening(false);
      }
    } else {
      // 开始录音
      try {
        console.log('🎤 开始录音...');
        audioRecorder.resetError();
        await audioRecorder.startRecording();
        console.log('🎤 录音开始成功');
        setIsListening(true);
      } catch (error) {
        console.error('🎤 开始录音失败:', error);
        Toast.error('无法访问麦克风，请检查权限设置');
      }
    }
  }, [isListening, audioRecorder, setInputValue]);

  return {
    inputValue,
    isListening,
    textareaRef,
    handleInputChange,
    handleMicrophoneClick,
    clearInput,
    createNewSession,
    audioRecorder,
  };
};