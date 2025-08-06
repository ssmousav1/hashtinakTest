'use client';

import { useRef, useEffect, useState } from 'react';

interface VoiceRecorderProps {
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  onAudioData: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export default function VoiceRecorder({
  isRecording,
  setIsRecording,
  onAudioData,
  isProcessing,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const visualizeAudio = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      visualizeAudio(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioData(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`
              relative w-24 h-24 rounded-full transition-all duration-300
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              shadow-lg transform hover:scale-105
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isRecording ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </div>
            
            {isRecording && (
              <div 
                className="absolute inset-0 rounded-full border-4 border-red-300"
                style={{
                  transform: `scale(${1 + audioLevel * 0.5})`,
                  opacity: 0.5 + audioLevel * 0.5,
                  transition: 'transform 0.1s, opacity 0.1s'
                }}
              />
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-white font-medium">
            {isProcessing 
              ? 'Processing...' 
              : isRecording 
              ? 'Recording... Click to stop' 
              : 'Click to start recording'}
          </p>
          {isRecording && (
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-400 transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}