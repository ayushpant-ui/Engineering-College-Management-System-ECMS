import { Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-authguard';
import { StudentsService } from './students.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { validateImageFile } from './dto/update-student-profile.dto';

type Request = {
    sub :string;
}

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

@Post('me/profile')
async updateProfile(@Req() req:Request , updateStudentProfileDto: any) {
    const id = req.sub; 
    async function updateStudentProfile(id: string, updateStudentProfileDto: any) {


}
}
}