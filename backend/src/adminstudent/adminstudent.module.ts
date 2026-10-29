import { Module } from '@nestjs/common';
import { AdminStudentsService } from './adminstudent.service';
import { AdminstudentController } from './adminstudent.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAuthModule } from '@/adminauth/adminauth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports : [AdminAuthModule,PrismaModule],
  providers: [AdminStudentsService],
  controllers: [AdminstudentController]
})
export class AdminstudentModule {}
