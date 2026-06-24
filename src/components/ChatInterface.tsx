import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Brain, Heart, Sparkles } from 'lucide-react';

interface Props {
  characterId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'character';
  content: string;
  actions?: string[];
  expressions?: string[];
  metadata?: {
    subconsciousActivation?: {
      triggeredTalents: string[];
      activatedMemories: string[];
      currentAcquiredPersonality: string;
    };
    mindDecision?: {
      valueJudgment: string;
      formedIntention: string;
      expressionStrategy: string;
    };
  };
  timestamp: Date;
}

export default function ChatInterface({ characterId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/${characterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const characterMessage: Message = {
          id: data.data.message.id,
          role: 'character',
          content: data.data.message.content,
          actions: data.data.message.actions,
          expressions: data.data.message.expressions,
          metadata: data.data.debug,
          timestamp: new Date(data.data.message.timestamp),
        };

        setMessages(prev => [...prev, characterMessage]);
        setSessionId(data.data.sessionId);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 添加错误消息
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'character',
        content: '抱歉，我暂时无法回应。请检查网络连接或稍后重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回列表
        </button>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            showDebug ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'
          }`}
        >
          {showDebug ? '隐藏' : '显示'}内心活动
        </button>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">开始对话</h3>
            <p className="text-gray-400">发送消息，与角色开始独特的聊天体验</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
              }`}
            >
              {/* 角色消息头部 */}
              {message.role === 'character' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-purple-300 font-medium">角色</span>
                </div>
              )}

              {/* 消息内容 */}
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* 动作和表情 */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-2 text-sm text-gray-400">
                  <span className="text-purple-400">动作：</span>
                  {message.actions.join('、')}
                </div>
              )}

              {/* 调试信息 */}
              {showDebug && message.metadata && message.role === 'character' && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-500 space-y-1">
                    {message.metadata.subconsciousActivation && (
                      <div>
                        <span className="text-pink-400 font-medium">潜意识：</span>
                        {message.metadata.subconsciousActivation.triggeredTalents.join(', ')}
                      </div>
                    )}
                    {message.metadata.mindDecision && (
                      <div>
                        <span className="text-blue-400 font-medium">心智：</span>
                        {message.metadata.mindDecision.formedIntention}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 时间戳 */}
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-end space-x-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-3 rounded-lg transition-colors ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
}
