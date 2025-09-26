// AgentChatRoom 组件相关类型定义

export interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  sessionId?: string;
}

export interface SSEMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error' | 'incomplete' | 'complete';
  hasAudio?: boolean; // 标记是否有音频版本
}

// 连接状态类型
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

// 录音结果类型
export interface RecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  format: string;
}

// 语音转文本结果类型
export interface SpeechToTextResult {
  text: string;
  confidence: number;
  error?: string;
}

// 组件 Props 类型
export interface AgentChatRoomProps {
  agent: Agent;
  onBack: () => void;
}

// 消息输入组件 Props
export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onRecordingComplete?: (result: RecordingResult) => void;
}

// 消息列表组件 Props
export interface MessageListProps {
  messages: SSEMessage[] | null;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
}

// 消息项组件 Props
export interface MessageItemProps {
  message: SSEMessage;
  isLast: boolean;
}