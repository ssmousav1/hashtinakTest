# Voice-to-Voice AI Agent

A full-stack web application that enables voice conversations with an AI assistant using OpenAI's Whisper, GPT, and TTS APIs.

## Features

- 🎤 Voice recording using browser's MediaRecorder API
- 🗣️ Speech-to-text transcription using OpenAI Whisper
- 🤖 AI responses powered by ChatGPT
- 🔊 Text-to-speech synthesis using OpenAI TTS
- 💬 Real-time conversation history with localStorage persistence
- 📁 Export chat history as JSON file
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 📊 Visual audio level indicators

## Tech Stack

- **Backend**: NestJS
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **AI Services**: OpenAI (Whisper, GPT-3.5, TTS)

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key

## Installation

### For Windows Users



### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd voice-ai-agent/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- The `.env` file is already configured with the provided OpenAI API key
- Default port is 3002

4. Start the backend server:
```bash
npm run start:dev
```

The backend will be available at http://localhost:3002

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd voice-ai-agent/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- The `.env.local` file is already configured
- Points to backend at http://localhost:3002

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Click the microphone button to start recording
3. Speak your message
4. Click the button again to stop recording
5. The AI will transcribe your speech, generate a response, and speak it back
6. View the conversation history on the right panel
7. Use the Reset button to clear the conversation

## API Endpoints

- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/respond` - Generate AI response
- `POST /api/speak` - Convert text to speech

## Project Structure

```
voice-ai-agent/
├── backend/
│   ├── src/
│   │   ├── voice/
│   │   │   ├── voice.controller.ts
│   │   │   ├── voice.service.ts
│   │   │   └── voice.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   │   ├── VoiceRecorder.tsx
│   │   ├── TranscriptArea.tsx
│   │   └── ConversationHistory.tsx
│   └── .env.local
└── README.md
```

## Features Implementation

✅ Voice Input - MediaRecorder API captures audio
✅ Speech-to-Text - OpenAI Whisper transcribes audio
✅ AI Response - ChatGPT generates contextual responses
✅ Text-to-Speech - OpenAI TTS synthesizes voice output
✅ Conversation History - Maintains chat context with localStorage persistence
✅ Chat Export - Download conversation history as JSON
✅ Responsive UI - Mobile-friendly design with Tailwind CSS
✅ Error Handling - Graceful error management
✅ Visual Feedback - Audio level indicators and loading states
✅ Automatic Save - Messages persist across browser sessions