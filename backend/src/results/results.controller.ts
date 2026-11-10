import { Controller, Post } from '@nestjs/common';
import { CreateExamPeriodDto } from './dto/create-exam-period.dto';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) {}
    
    @Post('exam-period')
    async createExamPeriod(data: CreateExamPeriodDto) {
        return this.resultsService.createResultsByExamPeriod(data);
    }
}
