'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptArea from '@/components/TranscriptArea';
import ConversationHistory from '@/components/ConversationHistory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const STORAGE_KEY = 'voice-ai-chat-history';

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages]);

  const handleAudioData = async (recordedAudio: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'recording.webm');

      const transcribeResponse = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { transcript } = await transcribeResponse.json();
      
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: transcript, 
        timestamp: new Date() 
      }]);

      const respondResponse = await fetch(`${API_URL}/api/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript }),
      });

      if (!respondResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response } = await respondResponse.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date() 
      }]);

      const speakResponse = await fetch(`${API_URL}/api/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: response }),
      });

      if (!speakResponse.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const { audio } = await speakResponse.json();
      
      const binaryString = atob(audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Voice AI Assistant
          </h1>
          <p className="text-gray-300 text-lg">
            Speak naturally and let AI respond with voice
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <VoiceRecorder
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onAudioData={handleAudioData}
              isProcessing={isProcessing}
            />
            
            <TranscriptArea 
              currentMessage={messages[messages.length - 1]}
              isProcessing={isProcessing}
            />
          </div>

          <div className="space-y-6">
            <ConversationHistory 
              messages={messages}
              onReset={handleReset}
            />
          </div>
        </div>

        <audio ref={audioRef} className="hidden" />
      </div>
    </main>
  );
}