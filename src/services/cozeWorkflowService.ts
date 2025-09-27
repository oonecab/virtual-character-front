import { fetchEventSource } from '@microsoft/fetch-event-source';
import { TokenManager } from '../utils/request';

/**
 * Coze工作流响应数据接口
 */
export interface CozeWorkflowResponse {
  type: string;
  content: string;
}

/**
 * 工作流消息接口
 */
export interface WorkflowMessage {
  content: string;
  nodeTitle?: string;
  nodeSeqID?: number;
  nodeIsFinish?: boolean;
  token?: string | null;
  ext?: any;
  usage?: any;
}

/**
 * Coze工作流SSE处理器选项
 */
export interface CozeSSEHandlerOptions {
  onMessage: (content: string) => void;
  onComplete: (finalContent: string) => void;
  onError: (error: Error) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

/**
 * 消息队列项
 */
interface MessageQueueItem {
  content: string;
  timestamp: number;
}

/**
 * Coze工作流SSE处理器
 */
export class CozeWorkflowSSEHandler {
  private abortController: AbortController | null = null;
  private fullContent = '';
  private options: CozeSSEHandlerOptions;
  private messageQueue: MessageQueueItem[] = [];
  private isProcessingQueue = false;
  private typewriterTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private connectionId = 0;

  // 打字机效果配置
  private readonly TYPEWRITER_DELAY = 50; // 每个字符的延迟（毫秒）
  private readonly BATCH_SIZE = 1; // 每次处理的字符数

  constructor(options: CozeSSEHandlerOptions) {
    this.options = options;
  }

  /**
   * 启动Coze工作流SSE连接
   * @param workflowId 工作流ID
   * @param message 用户消息
   */
  async startConnection(workflowId: string, message: string): Promise<void> {
    const currentConnectionId = ++this.connectionId;
    console.log(`🚀 CozeWorkflowSSEHandler: 启动连接 #${currentConnectionId}`, { workflowId, message });
    
    // 立即关闭之前的连接
    this.closeConnection();
    
    // 重置状态
    this.fullContent = '';
    this.messageQueue = [];
    this.isProcessingQueue = false;
    this.isConnected = false;
    
    // 创建新的AbortController
    this.abortController = new AbortController();
    
    // 通知连接状态
    this.options.onStatusChange?.('connecting');
    
    try {
      // 构建Coze工作流POST请求
      const url = `/api/xunzhi/v1/coze/workflow/${workflowId}/stream`;
      const requestBody = {
        userInput: message,
        conversationName: `conversation_${Date.now()}`,
        userId: 'user_001',
        extraParams: {},
        debug: false,
        timeout: 30,
        language: 'zh-CN'
      };
      
      // 获取token
      const token = TokenManager.getToken();

      console.log(`📡 发起Coze工作流fetchEventSource POST请求 #${currentConnectionId}:`, { url, requestBody });

      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
        
        onopen: async (response) => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 已被替换，忽略`);
            return;
          }
          
          console.log(`✅ Coze工作流SSE连接已打开 #${currentConnectionId}:`, response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          this.isConnected = true;
          this.options.onStatusChange?.('connected');
        },
        
        onmessage: (event) => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 消息被忽略`);
            return;
          }
          
          console.log(`📥 收到Coze工作流SSE消息 #${currentConnectionId}:`, event.data);
          this.handleSSEMessage(event.data);
        },
        
        onclose: () => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 关闭被忽略`);
            return;
          }
          
          console.log(`🔒 Coze工作流SSE连接已关闭 #${currentConnectionId}`);
          this.isConnected = false;
          this.options.onStatusChange?.('disconnected');
          
          // 处理剩余队列并完成
          this.finishProcessing();
        },
        
        onerror: (error) => {
          // 检查连接是否已被替换
          if (currentConnectionId !== this.connectionId) {
            console.log(`⚠️ 连接 #${currentConnectionId} 错误被忽略`);
            return;
          }
          
          console.error(`❌ Coze工作流SSE连接错误 #${currentConnectionId}:`, error);
          this.isConnected = false;
          this.options.onStatusChange?.('error');
          this.options.onError(error instanceof Error ? error : new Error('Coze workflow SSE connection error'));
          throw error;
        }
      });
      
    } catch (error) {
      // 检查连接是否已被替换
      if (currentConnectionId !== this.connectionId) {
        console.log(`⚠️ 连接 #${currentConnectionId} 启动错误被忽略`);
        return;
      }
      
      console.error(`❌ Coze工作流SSE连接启动失败 #${currentConnectionId}:`, error);
      this.isConnected = false;
      this.options.onStatusChange?.('error');
      this.options.onError(error instanceof Error ? error : new Error('Failed to start Coze workflow SSE connection'));
    }
  }

  /**
   * 处理SSE消息
   */
  private handleSSEMessage(data: string): void {
    try {
      // 检查是否是完成标识
      if (data.trim() === '[DONE]') {
        console.log('✅ Coze工作流消息完成');
        this.finishProcessing();
        return;
      }
      
      // 处理新的SSE数据格式 data:{...}
      let jsonData = data;
      if (data.startsWith('data:')) {
        jsonData = data.substring(5); // 移除 'data:' 前缀
      }
      
      // 解析数据
      const parsedContent = this.parseCozeSSEData(jsonData);
      if (parsedContent) {
        // 添加到消息队列
        this.messageQueue.push({
          content: parsedContent,
          timestamp: Date.now()
        });
        
        // 启动队列处理
        this.processMessageQueue();
      }
    } catch (error) {
      console.error('❌ 处理Coze工作流SSE消息失败:', error);
      this.options.onError(error as Error);
    }
  }

  /**
   * 处理消息队列（打字机效果）
   */
  private processMessageQueue(): void {
    if (this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    const processNext = () => {
      if (this.messageQueue.length === 0) {
        this.isProcessingQueue = false;
        return;
      }
      
      // 取出队列中的消息
      const queueItem = this.messageQueue.shift();
      if (!queueItem) {
        this.isProcessingQueue = false;
        return;
      }
      
      // 拆分内容为字符
      const chars = queueItem.content.split('');
      let charIndex = 0;
      
      const typeNextBatch = () => {
        if (charIndex >= chars.length) {
          // 当前消息处理完成，处理下一个
          this.typewriterTimer = setTimeout(processNext, this.TYPEWRITER_DELAY);
          return;
        }
        
        // 处理一批字符
        let batch = '';
        for (let i = 0; i < this.BATCH_SIZE && charIndex < chars.length; i++) {
          batch += chars[charIndex++];
        }
        
        // 更新累积内容
        this.fullContent += batch;
        
        // 通知UI更新
        this.options.onMessage(batch);
        
        // 继续处理下一批
        this.typewriterTimer = setTimeout(typeNextBatch, this.TYPEWRITER_DELAY);
      };
      
      typeNextBatch();
    };
    
    processNext();
  }

  /**
   * 完成处理
   */
  private finishProcessing(): void {
    // 清理打字机定时器
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    
    // 立即处理剩余队列
    while (this.messageQueue.length > 0) {
      const queueItem = this.messageQueue.shift();
      if (queueItem) {
        this.fullContent += queueItem.content;
        this.options.onMessage(queueItem.content);
      }
    }
    
    this.isProcessingQueue = false;
    
    // 触发完成回调
    this.options.onComplete(this.fullContent);
    
    // 关闭连接
    this.closeConnection();
  }

  /**
   * 解析Coze工作流SSE数据
   */
  private parseCozeSSEData(rawData: string): string | null {
    try {
      // 检查数据是否为空
      if (!rawData || rawData.trim() === '') {
        console.log('⚠️ 收到空数据，跳过处理');
        return null;
      }

      // 解析JSON数据
      const data: CozeWorkflowResponse = JSON.parse(rawData);
      console.log('📊 解析后的Coze工作流数据:', data);

      // 处理content类型的消息
      if (data.type === 'content' && data.content) {
        // 解析WorkflowEventMessage格式
        const workflowMessage = this.parseWorkflowEventMessage(data.content);
        if (workflowMessage) {
          // 检查content是否为空或只包含空白字符
          if (workflowMessage.content && workflowMessage.content.trim() !== '') {
            // 只返回非空的content内容，不包含WorkflowEventMessage格式
            console.log('✅ 返回有效的WorkflowEventMessage content:', workflowMessage.content.substring(0, 50) + '...');
            return workflowMessage.content;
          } else {
            // 空白content直接跳过，不进行后续处理
            console.log('⚠️ 跳过空白content的WorkflowEventMessage，content值:', `"${workflowMessage.content}"`);
            return null;
          }
        }
        
        // 如果WorkflowEventMessage解析失败，检查原始content是否非空且不是WorkflowEventMessage格式
        if (data.content.trim() !== '' && !data.content.includes('WorkflowEventMessage(')) {
          console.log('✅ 返回非WorkflowEventMessage格式的content:', data.content.substring(0, 50) + '...');
          return data.content;
        }
        
        // 空白内容或无效的WorkflowEventMessage直接跳过
        console.log('⚠️ 跳过无效或空白的content');
        return null;
      }
      
      // 处理完成消息
      if (data.type === 'done' || data.type === 'finish') {
        this.finishProcessing();
        return null;
      }

      console.log('⚠️ 未识别的Coze工作流数据格式:', data);
      return null;
    } catch (error) {
      console.error('❌ Coze工作流JSON解析失败:', error, '原始数据:', rawData);
      return null;
    }
  }

  /**
   * 解析WorkflowEventMessage格式的内容
   * 格式: "WorkflowEventMessage(content=嘿, nodeTitle=结束, nodeSeqID=0, nodeIsFinish=false, token=null, ext=null, usage=null)"
   */
  private parseWorkflowEventMessage(content: string): WorkflowMessage | null {
    try {
      console.log('🔍 开始解析WorkflowEventMessage:', content);
      
      // 使用正则表达式解析WorkflowEventMessage格式
      const match = content.match(/WorkflowEventMessage\((.+)\)$/);
      if (!match) {
        console.log('❌ WorkflowEventMessage格式不匹配');
        return null;
      }
      
      const params = match[1];
      console.log('📋 提取的参数字符串:', params);
      
      const message: WorkflowMessage = {
        content: ''
      };
      
      // 改进的参数解析逻辑，能够处理嵌套对象和空值
      const parseParams = (paramStr: string): Record<string, string> => {
        const result: Record<string, string> = {};
        let i = 0;
        
        while (i < paramStr.length) {
          // 跳过空格和逗号
          while (i < paramStr.length && /[\s,]/.test(paramStr[i])) {
            i++;
          }
          
          if (i >= paramStr.length) break;
          
          // 查找键名
          const keyStart = i;
          while (i < paramStr.length && paramStr[i] !== '=') {
            i++;
          }
          
          if (i >= paramStr.length) break;
          
          const key = paramStr.substring(keyStart, i).trim();
          i++; // 跳过 '='
          
          // 查找值
          const valueStart = i;
          let depth = 0;
          let inString = false;
          
          while (i < paramStr.length) {
            const char = paramStr[i];
            
            if (char === '"' || char === "'") {
              inString = !inString;
            } else if (!inString) {
              if (char === '(' || char === '{' || char === '[') {
                depth++;
              } else if (char === ')' || char === '}' || char === ']') {
                depth--;
              } else if (char === ',' && depth === 0) {
                break;
              }
            }
            i++;
          }
          
          const value = paramStr.substring(valueStart, i).trim();
          result[key] = value;
          console.log(`📝 解析参数: ${key} = ${value}`);
        }
        
        return result;
      };
      
      const parsedParams = parseParams(params);
      
      // 处理各个字段
      if (parsedParams.content !== undefined) {
        // 过滤空白或只包含空格的content
        const contentValue = parsedParams.content.trim();
        message.content = contentValue;
        
        // 如果content为空，记录日志但仍然返回消息对象（让上层决定是否处理）
        if (contentValue === '') {
          console.log('⚠️ 解析到空白content，content值:', `"${parsedParams.content}"`);
        }
      }
      
      if (parsedParams.nodeTitle && parsedParams.nodeTitle !== 'null') {
        message.nodeTitle = parsedParams.nodeTitle;
      }
      
      if (parsedParams.nodeSeqID && parsedParams.nodeSeqID !== 'null') {
        message.nodeSeqID = parseInt(parsedParams.nodeSeqID);
      }
      
      if (parsedParams.nodeIsFinish) {
        message.nodeIsFinish = parsedParams.nodeIsFinish === 'true';
      }
      
      if (parsedParams.token && parsedParams.token !== 'null') {
        message.token = parsedParams.token;
      }
      
      if (parsedParams.ext && parsedParams.ext !== 'null') {
        message.ext = parsedParams.ext;
      }
      
      if (parsedParams.usage && parsedParams.usage !== 'null') {
        // 尝试解析usage对象
        try {
          if (parsedParams.usage.startsWith('ChatUsage(')) {
            // 简单解析ChatUsage对象
            const usageMatch = parsedParams.usage.match(/ChatUsage\((.+)\)/);
            if (usageMatch) {
              const usageParams = parseParams(usageMatch[1]);
              message.usage = {
                tokenCount: usageParams.tokenCount ? parseInt(usageParams.tokenCount) : 0,
                outputCount: usageParams.outputCount ? parseInt(usageParams.outputCount) : 0,
                outputTokens: usageParams.outputTokens ? parseInt(usageParams.outputTokens) : 0,
                inputTokens: usageParams.inputTokens ? parseInt(usageParams.inputTokens) : 0,
                inputCount: usageParams.inputCount ? parseInt(usageParams.inputCount) : 0
              };
            }
          } else {
            message.usage = parsedParams.usage;
          }
        } catch (usageError) {
          console.warn('⚠️ 解析usage字段失败:', usageError);
          message.usage = parsedParams.usage;
        }
      }
      
      console.log('✅ 解析完成的消息对象:', message);
      return message;
    } catch (error) {
      console.error('❌ 解析WorkflowEventMessage失败:', error);
      console.error('❌ 原始内容:', content);
      return null;
    }
  }

  /**
   * 关闭连接
   */
  closeConnection(): void {
    if (this.abortController) {
      console.log('🔒 关闭Coze工作流SSE连接');
      this.abortController.abort();
      this.abortController = null;
    }
    
    // 清理打字机定时器
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    
    // 重置状态
    this.isConnected = false;
    this.isProcessingQueue = false;
    this.messageQueue = [];
    
    this.options.onStatusChange?.('disconnected');
  }

  /**
   * 获取当前累积内容
   */
  getCurrentContent(): string {
    return this.fullContent;
  }

  /**
   * 获取连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessingQueue
    };
  }
}

/**
 * Coze工作流服务类
 */
export class CozeWorkflowService {
  /**
   * 工作流ID映射配置
   */
  private static readonly WORKFLOW_ID_MAP: Record<string, string> = {
    'huolin': '7554639614646698020', // 火麟飞工作流ID
    'huolingfei': '7554639614646698020', // 火麟飞工作流ID（别名）
    '火麟飞': '7554639614646698020', // 火麟飞工作流ID（中文名）
    'xiyangyang': '7554672268761366580', // 喜羊羊工作流ID
    '喜羊羊': '7554672268761366580', // 喜羊羊工作流ID（中文名）
    'default': '7554639614646698020', // 默认工作流ID
    // 可以在这里添加更多工作流ID映射
  };

  /**
   * 根据Agent类型获取工作流ID
   * @param agentType Agent类型或名称
   * @returns 工作流ID
   */
  static getWorkflowId(agentType: string): string {
    console.log('🔍 查找工作流ID，输入参数:', agentType);
    console.log('🗂️ 可用的工作流映射:', Object.keys(this.WORKFLOW_ID_MAP));
    
    // 先尝试直接匹配
    if (this.WORKFLOW_ID_MAP[agentType]) {
      console.log('✅ 直接匹配成功:', agentType, '->', this.WORKFLOW_ID_MAP[agentType]);
      return this.WORKFLOW_ID_MAP[agentType];
    }
    // 再尝试小写匹配
    if (this.WORKFLOW_ID_MAP[agentType.toLowerCase()]) {
      console.log('✅ 小写匹配成功:', agentType.toLowerCase(), '->', this.WORKFLOW_ID_MAP[agentType.toLowerCase()]);
      return this.WORKFLOW_ID_MAP[agentType.toLowerCase()];
    }
    // 最后返回默认值
    console.log('⚠️ 未找到匹配，使用默认工作流ID:', this.WORKFLOW_ID_MAP['default']);
    return this.WORKFLOW_ID_MAP['default'];
  }

  /**
   * 构建Coze工作流请求
   * @param workflowId 工作流ID
   * @param message 消息内容
   * @returns 包含URL和请求体的对象
   */
  static buildWorkflowRequest(workflowId: string, message: string) {
    const url = `/api/xunzhi/v1/coze/workflow/${workflowId}/stream`;
    const requestBody = {
      userInput: message,
      conversationName: `conversation_${Date.now()}`,
      userId: 'user_001',
      extraParams: {},
      debug: false,
      timeout: 30,
      language: 'zh-CN'
    };
    
    return {
      url,
      requestBody,
      workflowId,
      message
    };
  }

  /**
   * 获取所有可用的工作流ID
   * @returns 工作流ID映射对象
   */
  static getAllWorkflowIds(): Record<string, string> {
    return { ...this.WORKFLOW_ID_MAP };
  }
}