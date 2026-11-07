import { Module } from '@nestjs/common';

import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}