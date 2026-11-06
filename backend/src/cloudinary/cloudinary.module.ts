import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  controllers: [CloudinaryController]
})
export class CloudinaryModule {}
