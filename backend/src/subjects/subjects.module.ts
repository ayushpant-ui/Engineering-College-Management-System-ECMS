import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAuthModule } from '@/adminauth/adminauth.module';

@Module({
  imports: [PrismaModule,AdminAuthModule],
  controllers: [SubjectsController],
  providers: [SubjectsService]
})
export class SubjectsModule {}
