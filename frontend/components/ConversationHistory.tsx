'use client';

import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  messages: Message[];
  onReset: () => void;
}

const exportChatHistory = (messages: Message[]) => {
  const chatData = {
    exportDate: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }))
  };

  const dataStr = JSON.stringify(chatData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `voice-ai-chat-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ConversationHistory({ messages, onReset }: ConversationHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Conversation History
        </h3>
        
        <div className="flex space-x-2">
          {messages.length > 0 && (
            <button
              onClick={() => exportChatHistory(messages)}
              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg 
                         transition-colors duration-200 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Export
            </button>
          )}
          
          <button
            onClick={onReset}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg 
                       transition-colors duration-200 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7h5v2h-5v2l-3-3 3-3v2zm-3 5v6H6v-6h8m2-2H4v10h12V10z"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
            </svg>
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start a conversation by recording your voice</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500/30 border border-blue-400/30'
                  : 'bg-green-500/30 border border-green-400/30'
              } rounded-xl p-3 shadow-md`}>
                <div className="flex items-center mb-1">
                  <span className={`text-xs font-semibold ${
                    message.role === 'user' ? 'text-blue-300' : 'text-green-300'
                  }`}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Auto-saved locally
            </span>
          </div>
        </div>
      )}
    </div>
  );
}