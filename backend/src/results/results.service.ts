import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamPeriodDto } from './dto/create-exam-period.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async createResultsByExamPeriod(dto: CreateExamPeriodDto) {
    if (
      dto.startsAt &&
      dto.endsAt &&
      new Date(dto.endsAt) < new Date(dto.startsAt)
    ) {
      throw new BadRequestException(
        'End date cannot be earlier than start date',
      );
    }
    try{
    const result = await this.prisma.examPeriod.create({
      data: {
        name: dto.name.trim(),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  
    return {
      message: 'Exam period created successfully',
    };
  }  
   catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An exam period with this name already exists',
        );
      }
  }
}

  async getResultsByExamPeriod(){
    const examPeriods = await this.prisma.examPeriod.findMany({
        select: {
            id:true,
            name:true,
            startsAt:true,
            endsAt:true,
            createdAt:true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return {
        message: 'Exam period fetched successfully',
        data: examPeriods
    }
  }

  async getResultsByExamPeriodId(id: number){
    const examPeriods = await this.prisma.examPeriod.findUnique({
        where: {
            id:id 
        },
        select: {
            id:true,
            name:true,
            startsAt:true,
            endsAt:true,
            createdAt:true,
        },
    })

    if(!examPeriods){
        throw new BadRequestException(`Exam period of id : ${id} not found`);
    }

    return {
        message: 'Exam period fetched successfully',
        data: examPeriods
    }
}
}