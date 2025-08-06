import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}