import { Module } from '@nestjs/common';
import { AdminstudentService } from './adminstudent.service';
import { AdminstudentController } from './adminstudent.controller';

@Module({
  providers: [AdminstudentService],
  controllers: [AdminstudentController]
})
export class AdminstudentModule {}
