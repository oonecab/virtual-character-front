'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Typography, Space, message, Tooltip, Divider } from 'antd';
import { SendOutlined, AudioOutlined, AudioMutedOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import './CharacterChat.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'character';
  timestamp: Date;
  type: 'text' | 'audio';
}

interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  personality: string;
}

interface CharacterChatProps {
  characterId: string;
}

const CharacterChat: React.FC<CharacterChatProps> = ({ characterId }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();

  // 模拟角色数据
  const charactersData: Record<string, Character> = {
    '1': {
      id: '1',
      name: '测试智能体',
      description: '这是一个用于测试的AI智能体，可以进行基本的对话和交互功能测试',
      avatar: '🤖',
      category: '测试',
      personality: '我是一个测试智能体，专门用于验证AI对话系统的基本功能。我可以回答各种问题，进行简单的对话交互。让我们开始测试吧！'
    }
  };

  useEffect(() => {
    const currentCharacter = charactersData[characterId];
    if (currentCharacter) {
      setCharacter(currentCharacter);
      // 添加欢迎消息
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `你好！我是${currentCharacter.name}。${currentCharacter.personality}`,
        sender: 'character',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [characterId]);

  // 自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 使用页面级滚动，滚动到页面底部
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, character!);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'character',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string, character: Character): string => {
    const input = userInput.toLowerCase();
    
    if (character.category === '编程') {
      if (input.includes('javascript') || input.includes('js')) {
        return '关于JavaScript，这是一门非常强大的编程语言！它可以用于前端开发、后端开发（Node.js）、移动应用开发等。你想了解JavaScript的哪个方面呢？比如基础语法、异步编程、框架使用等？';
      }
      if (input.includes('react')) {
        return 'React是一个优秀的前端框架！它使用组件化的思想，让我们可以构建可复用的UI组件。React的核心概念包括JSX、组件、props、state和生命周期。你在使用React时遇到了什么问题吗？';
      }
      if (input.includes('python')) {
        return 'Python是一门简洁而强大的编程语言！它在数据科学、机器学习、Web开发等领域都有广泛应用。Python的语法简洁明了，非常适合初学者。你想学习Python的哪个方向呢？';
      }
      return '这是一个很好的编程问题！让我来帮你分析一下。编程的关键是要理解问题的本质，然后选择合适的算法和数据结构来解决。你能详细描述一下你遇到的具体问题吗？';
    }
    
    if (character.name === '哈利·波特') {
      if (input.includes('魔法') || input.includes('霍格沃茨')) {
        return '霍格沃茨真是一个神奇的地方！在那里我学会了各种魔法咒语，比如漂浮咒"Wingardium Leviosa"、照明咒"Lumos"等。魔法世界充满了奇迹，但也有危险。你想了解哪种魔法呢？';
      }
      if (input.includes('朋友') || input.includes('赫敏') || input.includes('罗恩')) {
        return '赫敏和罗恩是我最好的朋友！赫敏聪明勤奋，总是能在关键时刻想出解决办法；罗恩忠诚勇敢，虽然有时会害怕，但总是会站在我身边。真正的友谊是无价的！';
      }
      return '在霍格沃茨的日子里，我学到了很多东西，不仅仅是魔法，更重要的是关于勇气、友谊和爱的力量。每一次冒险都让我成长，让我明白什么是真正重要的。';
    }
    
    if (character.name === '苏格拉底') {
      return '这是一个值得深思的问题！让我们一起来探讨吧。你认为什么是真正的知识？我们如何才能确定我们所相信的是真实的？通过不断的提问和思辨，我们可以更接近真理。你对此有什么看法呢？';
    }
    
    return `作为${character.name}，我觉得你提出了一个很有趣的观点。让我们深入讨论一下这个话题。你能告诉我更多关于你的想法吗？`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // 这里可以实现语音转文字功能
        message.info('语音录制完成！（演示版本，实际需要集成语音识别API）');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      message.success('开始录音...');
    } catch (error) {
      message.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!character) {
    return (
      <div className="chat-container">
        <Card>
          <Text>角色不存在</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Card className="chat-card">
        {/* 聊天头部 */}
        <div className="chat-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            className="back-btn"
          >
            返回
          </Button>
          <div className="character-info">
            <Avatar size={48} className="character-avatar">
              {character.avatar}
            </Avatar>
            <div className="character-details">
              <Title level={4} className="character-name">{character.name}</Title>
              <Text type="secondary" className="character-desc">{character.description}</Text>
            </div>
          </div>
        </div>
        
        <Divider className="header-divider" />
        
        {/* 消息列表 */}
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.sender === 'character' && (
                  <Avatar size={32} className="message-avatar">
                    {character.avatar}
                  </Avatar>
                )}
                <div className="message-bubble">
                  <Text>{message.content}</Text>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <Avatar size={32} icon={<UserOutlined />} className="message-avatar user-avatar" />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message character">
              <div className="message-content">
                <Avatar size={32} className="message-avatar">
                  {character.avatar}
                </Avatar>
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 输入区域 */}
        <div className="input-area">
          <Space.Compact className="input-group">
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`与 ${character.name} 对话...`}
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="message-input"
            />
            <Tooltip title={isRecording ? '停止录音' : '语音输入'}>
              <Button
                type={isRecording ? 'primary' : 'default'}
                icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={isRecording ? stopRecording : startRecording}
                className="voice-btn"
                danger={isRecording}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              发送
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
};

export default CharacterChat;