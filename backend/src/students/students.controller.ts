import {
  Controller,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-authguard';
import { StudentsService } from './students.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { validateImageFile } from './dto/update-student-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('me/profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async updateProfileImage(
    @Req() req: { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    validateImageFile(file);
    const id = req.user.sub;
    
      return await this.studentsService.updateProfileImage(Number(id), file);
    }
  }

