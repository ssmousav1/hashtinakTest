'use client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TranscriptAreaProps {
  currentMessage?: Message;
  isProcessing: boolean;
}

export default function TranscriptArea({ currentMessage, isProcessing }: TranscriptAreaProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl min-h-[200px]">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        Current Transcript
      </h3>
      
      <div className="space-y-3">
        {isProcessing && !currentMessage && (
          <div className="flex items-center space-x-2">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-gray-300 text-sm">Processing audio...</span>
          </div>
        )}
        
        {currentMessage && (
          <div className={`p-3 rounded-lg ${
            currentMessage.role === 'user' 
              ? 'bg-blue-500/20 border-l-4 border-blue-400' 
              : 'bg-green-500/20 border-l-4 border-green-400'
          }`}>
            <div className="flex items-start space-x-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                currentMessage.role === 'user' ? 'text-blue-300' : 'text-green-300'
              }`}>
                {currentMessage.role === 'user' ? 'You' : 'AI'}
              </span>
            </div>
            <p className="text-white mt-1">{currentMessage.content}</p>
          </div>
        )}
        
        {!currentMessage && !isProcessing && (
          <p className="text-gray-400 text-center py-8">
            Start recording to see transcripts here
          </p>
        )}
      </div>
    </div>
  );
}