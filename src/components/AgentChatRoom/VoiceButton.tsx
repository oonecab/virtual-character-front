import React from 'react';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import { IconVolume2, IconLoading } from '@douyinfe/semi-icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface VoiceButtonProps {
  /** 要播放的文本内容 */
  text: string;
  /** Agent名称，用于选择对应的音色 */
  agentName?: string;
  /** 按钮大小 */
  size?: 'small' | 'default' | 'large';
  /** 是否显示为圆形按钮 */
  circle?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 语音播放按钮组件
 * 用于在聊天气泡中添加TTS语音播放功能
 */
const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  agentName,
  size = 'small',
  circle = true,
  style,
  className = '',
}) => {
  const { state, playText, stopAudio, clearError } = useAudioPlayer();

  // 组件渲染时的调试信息
  console.log('🎯 [VoiceButton] 组件渲染 - props:', { text: text?.substring(0, 30), agentName, disabled: !text || text.trim().length === 0 });

  const handleClick = async (e?: React.MouseEvent) => {
    // 最基础的点击检测
    console.log('🚨 [VoiceButton] ===== 按钮被点击了！ =====');
    console.log('🚨 [VoiceButton] 点击事件对象:', e);
    console.log('🚨 [VoiceButton] 当前时间:', new Date().toISOString());
    try {
      console.log('🔊 [VoiceButton] 点击语音播放按钮');
      console.log('🔊 [VoiceButton] 文本内容:', text.substring(0, 50) + '...');
      console.log('🔊 [VoiceButton] Agent名称:', agentName);
      console.log('🔊 [VoiceButton] 当前状态:', state);
      console.log('🔊 [VoiceButton] 文本长度:', text.length);
      console.log('🔊 [VoiceButton] 文本是否为空:', !text || text.trim().length === 0);
      console.log('🔊 [VoiceButton] 按钮是否被禁用:', !text || text.trim().length === 0);
      
      if (state.isPlaying) {
        // 如果正在播放，则停止播放
        console.log('🔊 [VoiceButton] 停止当前播放');
        stopAudio();
      } else {
        // 清除之前的错误
        if (state.error) {
          console.log('🔊 [VoiceButton] 清除之前的错误:', state.error);
          clearError();
        }
        
        // 开始播放，传递Agent名称
        console.log('🔊 [VoiceButton] 开始播放文本，调用playText方法');
        await playText(text, {}, agentName);
        console.log('🔊 [VoiceButton] playText方法调用完成');
      }
    } catch (error) {
      console.error('🔊 [VoiceButton] 播放失败:', error);
    }
  };

  // 根据状态确定按钮图标
  const getIcon = () => {
    if (state.isLoading) {
      return <IconLoading spin />;
    }
    return <IconVolume2 />;
  };

  // 根据状态确定按钮主题
  const getTheme = () => {
    if (state.isPlaying) {
      return 'solid';
    }
    return 'borderless';
  };

  // 根据状态确定按钮类型
  const getType = () => {
    if (state.isPlaying) {
      return 'primary';
    }
    return 'tertiary';
  };

  // 根据状态确定提示文本
  const getTooltipText = () => {
    if (state.isLoading) {
      return '正在生成语音...';
    }
    if (state.isPlaying) {
      return '点击停止播放';
    }
    if (state.error) {
      return `播放失败: ${state.error}`;
    }
    return '点击播放语音';
  };

  return (
    <Tooltip content={getTooltipText()} position="top">
      <Button
        theme={getTheme()}
        type={getType()}
        icon={getIcon()}
        onClick={(e) => {
          console.log('🎯 [VoiceButton] Button onClick 被调用');
          console.log('🎯 [VoiceButton] 事件参数:', e);
          handleClick(e);
        }}
        size={size}
        circle={circle}
        disabled={!text || text.trim().length === 0}
        style={{
          opacity: state.error ? 0.6 : 1,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          pointerEvents: 'auto',
          ...style,
        }}
        className={`voice-button ${className} ${state.isPlaying ? 'playing' : ''} ${state.error ? 'error' : ''}`}
      />
    </Tooltip>
  );
};

export default VoiceButton;