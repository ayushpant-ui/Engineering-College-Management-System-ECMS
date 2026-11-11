import { Module } from '@nestjs/common';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAuthModule } from '@/adminauth/adminauth.module';

@Module({
  imports: [PrismaModule,AdminAuthModule],
  controllers: [ResultsController],
  providers: [ResultsService]
})
export class ResultsModule {}
