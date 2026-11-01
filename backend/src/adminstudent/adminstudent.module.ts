import { Module } from '@nestjs/common';
import { AdminStudentsService } from './adminstudent.service';
import { AdminStudentController } from './adminstudent.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAuthModule } from '@/adminauth/adminauth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminDepartmentsController } from './departments/admin-departments.controller';
import { AdminAcademicYearsController } from './academic-years/admin-academic-years.controller';

@Module({
  imports : [AdminAuthModule,PrismaModule],
  providers: [AdminStudentsService],
  controllers: [AdminStudentController,AdminDepartmentsController,AdminAcademicYearsController]
})
export class AdminstudentModule {}
