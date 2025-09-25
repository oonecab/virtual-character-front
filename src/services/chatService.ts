import { Message, Session, ChatState } from '../contexts/ChatContext';

// API 基础配置
const API_BASE_URL = 'http://localhost:8080';

// 消息相关API
export const messageAPI = {
  // 发送消息
  sendMessage: async (sessionId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message: content,
      }),
    });

    if (!response.ok) {
      throw new Error('发送消息失败');
    }

    const data = await response.json();
    return {
      id: Date.now().toString(),
      content: data.response || '抱歉，我现在无法回复。',
      sender: 'ai',
      timestamp: new Date(),
      sessionId,
    };
  },

  // 获取会话消息
  getMessages: async (sessionId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/messages/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('获取消息失败');
    }

    const data = await response.json();
    return data.messages || [];
  },
};

// 会话相关API
export const sessionAPI = {
  // 获取会话列表
  getSessions: async (): Promise<Session[]> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/sessions`);
    
    if (!response.ok) {
      throw new Error('获取会话列表失败');
    }

    const data = await response.json();
    return data.sessions || [];
  },

  // 创建新会话
  createSession: async (title?: string): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || '新对话',
      }),
    });

    if (!response.ok) {
      throw new Error('创建会话失败');
    }

    const data = await response.json();
    return {
      id: data.sessionId || Date.now().toString(),
      title: data.title || '新对话',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  // 删除会话
  deleteSession: async (sessionId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('删除会话失败');
    }
  },

  // 更新会话标题
  updateSession: async (sessionId: string, title: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-chat/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('更新会话失败');
    }
  },
};

// 聊天业务逻辑服务
export class ChatService {
  // 发送消息并获取回复
  static async sendMessageAndGetReply(
    sessionId: string,
    content: string,
    onUserMessage?: (message: Message) => void,
    onAIMessage?: (message: Message) => void
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      sessionId,
    };

    // 立即显示用户消息
    onUserMessage?.(userMessage);

    try {
      // 发送消息并获取AI回复
      const aiMessage = await messageAPI.sendMessage(sessionId, content);
      onAIMessage?.(aiMessage);

      return { userMessage, aiMessage };
    } catch (error) {
      // 创建错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        sender: 'ai',
        timestamp: new Date(),
        sessionId,
      };

      onAIMessage?.(errorMessage);
      throw error;
    }
  }

  // 创建新会话并发送第一条消息
  static async createSessionAndSendMessage(
    content: string,
    onSessionCreated?: (session: Session) => void,
    onUserMessage?: (message: Message) => void,
    onAIMessage?: (message: Message) => void
  ): Promise<{ session: Session; userMessage: Message; aiMessage: Message }> {
    // 创建新会话
    const session = await sessionAPI.createSession();
    onSessionCreated?.(session);

    // 发送消息
    const { userMessage, aiMessage } = await this.sendMessageAndGetReply(
      session.id,
      content,
      onUserMessage,
      onAIMessage
    );

    return { session, userMessage, aiMessage };
  }

  // 加载会话数据
  static async loadSessionData(sessionId: string): Promise<{
    session: Session | null;
    messages: Message[];
  }> {
    try {
      const [sessions, messages] = await Promise.all([
        sessionAPI.getSessions(),
        messageAPI.getMessages(sessionId),
      ]);

      const session = sessions.find(s => s.id === sessionId) || null;
      return { session, messages };
    } catch (error) {
      console.error('加载会话数据失败:', error);
      return { session: null, messages: [] };
    }
  }
}

export default ChatService;