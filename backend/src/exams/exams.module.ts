import { Module } from '@nestjs/common';

import { AdminExamsController } from './controllers/admin-exams.controller';
import { StudentExamsController } from './controllers/student-exams.controller';
import { ExamApplicationsController } from './controllers/exam-applications.controller';

import { ExamsService } from './services/exams.service';
import { ExamApplicationsService } from './services/exam-applications.service';

@Module({
  controllers: [
    AdminExamsController,
    StudentExamsController,
    ExamApplicationsController,
  ],
  providers: [
    ExamsService,
    ExamApplicationsService,
  ],
  exports: [
    ExamsService,
    ExamApplicationsService,
  ],
})
export class ExamsModule {}