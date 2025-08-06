import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No audio file provided', HttpStatus.BAD_REQUEST);
      }
      const transcript = await this.voiceService.transcribeAudio(file.path);
      return { transcript };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to transcribe audio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('respond')
  async respond(@Body('text') text: string) {
    try {
      if (!text) {
        throw new HttpException('No text provided', HttpStatus.BAD_REQUEST);
      }
      const response = await this.voiceService.generateResponse(text);
      return { response };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('speak')
  async speak(@Body('text') text: string) {
    try {
      if (!text) {
        throw new HttpException('No text provided', HttpStatus.BAD_REQUEST);
      }
      const audioBuffer = await this.voiceService.textToSpeech(text);
      return { audio: audioBuffer.toString('base64') };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to convert text to speech',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}