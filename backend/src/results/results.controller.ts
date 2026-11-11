import { Controller, Get, Post,Param,Body,ParseIntPipe } from '@nestjs/common';
import { CreateExamPeriodDto } from './dto/create-exam-period.dto';
import { ResultsService } from './results.service';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '@/adminauth/admin.guard';

@UseGuards(AdminGuard) 
@Controller('admin/results')
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) {}
    
    @Post('exam-periods')
    async createExamPeriod(@Body() dto: CreateExamPeriodDto) {
        return this.resultsService.createResultsByExamPeriod(dto);
    }

    @Get('exam-periods')
    async getResultsByExamPeriod() {
        return this.resultsService.getResultsByExamPeriod();
    }


    @Get('exam-period/:id')
    async getResultsByExamPeriodId(@Param('id', ParseIntPipe) id: number) {
        return this.resultsService.getResultsByExamPeriodId(id);
    }
}
