import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

@Injectable()
export class VoiceService {
  private openai: OpenAI;
  private conversationHistory: ChatMessage[] = [];

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async transcribeAudio(filePath: string): Promise<string> {
    try {
      const audioFile = fs.createReadStream(filePath);
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      fs.unlinkSync(filePath);

      this.conversationHistory.push({
        role: 'user',
        content: transcription.text,
      });

      return transcription.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async generateResponse(text: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful voice assistant. Keep responses concise and conversational.',
          },
          ...this.conversationHistory,
          { role: 'user', content: text },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content || '';

      if (response) {
        this.conversationHistory.push({
          role: 'assistant',
          content: response,
        });
      }

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return response;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async textToSpeech(text: string): Promise<Buffer> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('TTS error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  resetConversation(): void {
    this.conversationHistory = [];
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
}
