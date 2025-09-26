/**
 * Agent 会话管理服务
 * 处理 Agent 聊天的会话创建、管理和状态维护
 */

export interface AgentSession {
  sessionId: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  lastActiveAt: string;
  status: 'active' | 'inactive' | 'ended';
}

export interface CreateAgentSessionRequest {
  agentId: string;
  agentName: string;
  agentPrompt?: string;
}

export interface CreateAgentSessionResponse {
  sessionId: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  status: string;
}

class AgentSessionService {
  private baseUrl = '/api/agent-sessions';

  /**
   * 创建新的 Agent 会话
   */
  async createSession(request: CreateAgentSessionRequest): Promise<CreateAgentSessionResponse> {
    try {
      // 暂时使用模拟数据，后续替换为真实 API 调用
      const sessionId = this.generateSessionId();
      
      console.log('🚀 创建 Agent 会话:', {
        sessionId,
        agentId: request.agentId,
        agentName: request.agentName
      });

      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const response: CreateAgentSessionResponse = {
        sessionId,
        agentId: request.agentId,
        agentName: request.agentName,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // 存储到本地存储以便后续使用
      this.storeSessionLocally(response);

      return response;
    } catch (error) {
      console.error('❌ 创建 Agent 会话失败:', error);
      throw new Error('创建会话失败，请稍后重试');
    }
  }

  /**
   * 获取会话信息
   */
  async getSession(sessionId: string): Promise<AgentSession | null> {
    try {
      // 暂时从本地存储获取，后续替换为 API 调用
      const storedSession = localStorage.getItem(`agent_session_${sessionId}`);
      if (storedSession) {
        return JSON.parse(storedSession);
      }
      return null;
    } catch (error) {
      console.error('❌ 获取会话信息失败:', error);
      return null;
    }
  }

  /**
   * 更新会话活跃时间
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.lastActiveAt = new Date().toISOString();
        localStorage.setItem(`agent_session_${sessionId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('❌ 更新会话活跃时间失败:', error);
    }
  }

  /**
   * 结束会话
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.status = 'ended';
        localStorage.setItem(`agent_session_${sessionId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('❌ 结束会话失败:', error);
    }
  }

  /**
   * 生成会话 ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `agent_${timestamp}_${random}`;
  }

  /**
   * 本地存储会话信息
   */
  private storeSessionLocally(session: CreateAgentSessionResponse): void {
    const agentSession: AgentSession = {
      sessionId: session.sessionId,
      agentId: session.agentId,
      agentName: session.agentName,
      createdAt: session.createdAt,
      lastActiveAt: session.createdAt,
      status: 'active'
    };
    
    localStorage.setItem(`agent_session_${session.sessionId}`, JSON.stringify(agentSession));
    
    // 同时存储到会话列表中
    const sessionsList = this.getStoredSessionsList();
    sessionsList.unshift(agentSession);
    
    // 只保留最近的 20 个会话
    const limitedSessions = sessionsList.slice(0, 20);
    localStorage.setItem('agent_sessions_list', JSON.stringify(limitedSessions));
  }

  /**
   * 获取存储的会话列表
   */
  private getStoredSessionsList(): AgentSession[] {
    try {
      const stored = localStorage.getItem('agent_sessions_list');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * 获取用户的 Agent 会话历史
   */
  async getUserAgentSessions(): Promise<AgentSession[]> {
    try {
      return this.getStoredSessionsList();
    } catch (error) {
      console.error('❌ 获取用户 Agent 会话历史失败:', error);
      return [];
    }
  }
}

export const agentSessionService = new AgentSessionService();