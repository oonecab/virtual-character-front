import React, { useState, useRef } from 'react';
import { Input, Button } from '@douyinfe/semi-ui';
import { IconSend, IconMicrophone } from '@douyinfe/semi-icons';
import type { RecordingResult } from '../types';
import {Tooltip} from "antd";
import {AudioRecorder, useAudioRecorder} from "react-audio-voice-recorder";

/**
 * 消息输入组件的属性接口
 */
interface MessageInputProps {
  /** 消息发送回调函数 */
  onSendMessage: (message: string) => void;
  /** 录音完成回调函数 */
  onRecordingComplete?: (result: RecordingResult) => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 是否正在录音 */
  isRecording?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 消息输入组件
 * 
 * 功能：
 * - 文本消息输入和发送
 * - 语音录制功能
 * - 键盘快捷键支持（Enter发送）
 * - 加载状态显示
 * - 输入验证
 */

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  onRecordingComplete
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const recorderControls = useAudioRecorder();

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理录音完成
  const handleRecordingFinished = (blob: Blob) => {
    if (onRecordingComplete) {
      const result: RecordingResult = {
        audioBlob: blob,
        audioUrl: URL.createObjectURL(blob),
        duration: 0,
        format: 'webm'
      };
      onRecordingComplete(result);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e8e8e8',
      padding: '16px 20px',
      zIndex: 1000,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px'
      }}>
        {/* 文本输入框 */}
        <div style={{ flex: 1 }}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={isLoading}
            size="large"
            style={{
              borderRadius: '20px',
              paddingRight: '50px'
            }}
            suffix={
              <Button
                theme="borderless"
                icon={<IconSend />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  color: inputValue.trim() && !isLoading ? '#1890ff' : '#ccc'
                }}
              />
            }
          />
        </div>

        {/* 语音录制按钮 */}
        <Tooltip content="点击录音">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: recorderControls.isRecording ? '#ff4d4f' : '#1890ff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: recorderControls.isRecording 
              ? '0 0 20px rgba(255, 77, 79, 0.3)' 
              : '0 2px 8px rgba(24, 144, 255, 0.3)'
          }}>
            <AudioRecorder
              onRecordingComplete={handleRecordingFinished}
              recorderControls={recorderControls}
              audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
              }}
              showVisualizer={false}
              downloadOnSavePress={false}
              downloadFileExtension="webm"
            />
            <IconMicrophone 
              size="large" 
              style={{ 
                color: 'white',
                position: 'absolute',
                pointerEvents: 'none'
              }} 
            />
          </div>
        </Tooltip>
      </div>

      {/* 录音状态提示 */}
      {recorderControls.isRecording && (
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '12px',
          color: '#ff4d4f',
          animation: 'pulse 1.5s infinite'
        }}>
          🎤 正在录音...
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};