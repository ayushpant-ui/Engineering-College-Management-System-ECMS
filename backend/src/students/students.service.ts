import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class StudentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService
    ) {}
    async updateImage(){

    }
}
