import { Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';

@Controller('students/me')
export class StudentsController {

    @Post('/profile-image')
    async updateImage()
}
