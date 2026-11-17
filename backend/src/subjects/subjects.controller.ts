import { Controller, Get, Post,Body, UseGuards, Delete ,Param,ParseIntPipe} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject-dto';
import { SubjectsService } from './subjects.service';
import {AdminGuard} from '../adminauth/admin.guard'

@UseGuards(AdminGuard)
@Controller('admin')
export class SubjectsController {
    constructor(private subjectsService: SubjectsService) {}

    @Post('subjects')
    async createSubject(@Body() data: CreateSubjectDto) {
        return await this.subjectsService.createSubject(data);
    }

    @Get('subjects')
    async getAllSubjects() {
        return await this.subjectsService.getAllSubjects();
    }

    @Delete('subjects/:id')
    async deleteSubject(@Param('id',ParseIntPipe) id:number ){
        return await this.subjectsService.deleteSubject(id);
    }
 }

