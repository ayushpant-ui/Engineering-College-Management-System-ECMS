import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamPeriodDto } from './dto/create-exam-period.dto';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async createResultsByExamPeriod(data: CreateExamPeriodDto) {
    if (
      data.startsAt &&
      data.endsAt &&
      new Date(data.endsAt) < new Date(data.startsAt)
    ) {
      throw new BadRequestException(
        'End date cannot be earlier than start date',
      );
    }
    const result = await this.prisma.examPeriod.create({
      data: {
        name: data.name,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    return {
      message: 'Exam period created successfully',
    };
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