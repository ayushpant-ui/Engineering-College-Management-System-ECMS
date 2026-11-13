import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ContactModule } from './contact/contact.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from './adminauth/adminauth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { NoticesModule } from './notices/notices.module';
import { AdminstudentModule } from './adminstudent/adminstudent.module';
import { StudentsModule } from './students/students.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DepartmentsModule } from './departments/departments.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { CurriculaModule } from './curricula/curricula.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ExamsModule } from './exams/exams.module';
import { ResultsModule } from './results/results.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds
        limit: 10,   // Maximum 10 requests per window
      },
    ]),
    AuthModule,
    UserModule,
    ContactModule,
    PrismaModule,
    AdminAuthModule,
    NoticesModule,
    AdminstudentModule,
    StudentsModule,
    CloudinaryModule,
    DepartmentsModule,
    AcademicYearsModule,
    CurriculaModule,
    SubjectsModule,
    ExamsModule,
    ResultsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}