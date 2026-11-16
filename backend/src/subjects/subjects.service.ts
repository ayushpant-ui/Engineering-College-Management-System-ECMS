import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject-dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async createSubject(dto: CreateSubjectDto) {
    const subject = await this.prisma.subject.create({
        data: {
            code: dto.code,
            name: dto.name
        },
        select: {
            id: true,
            code: true,
            name: true
        }
    })
    return {
        message: 'Subject created successfully',
        subject
    }
  }


 async getAllSubjects() {
    const subjects = await this.prisma.subject.findMany({
        select: {
            id: true, 
            code: true,
            name: true
        }
    }); 
    return {
        message: 'Subjects retrieved successfully',
        data: subjects
    }
 }
}
