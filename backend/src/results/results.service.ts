import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamPeriodDto } from './dto/create-exam-period.dto';

@Injectable()
export class ResultsService {
    constructor(private readonly prisma: PrismaService) {}

    async getResultsByExamPeriod(examPeriodId: number) {

    }

    async createResultsByExamPeriod(data:CreateExamPeriodDto) {
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

    }
