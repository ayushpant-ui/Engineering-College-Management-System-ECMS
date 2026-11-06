import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class StudentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService
    ) {}
    async updateProfileImage(StudentId: number, file: Express.Multer.File){

        const user = await this.prisma.student.findUnique({
            where: {
                id:StudentId
            }
        })

        if(!user){
            throw new NotFoundException('Student not found');
        }
        
        // Uploading the new image to Cloudinary
        const uploadedImage = await this.cloudinary.uploadImage(file);
        // Updating the user's profile image URL and key in the database
        const updatedUser = await this.prisma.student.update({
            where: {
                id:StudentId
            },
            data: {
                profileImageUrl: uploadedImage.secure_url,
                profileImageKey: uploadedImage.public_id
            },
            select: {
                id:true,
                fullName:true,
                profileImageUrl:true,
            },
        });

        if (user.profileImageKey) {
            // Deleting the previous image from Cloudinary
            await this.cloudinary.deleteImage(user.profileImageKey);
        }
        return {
            message: 'Profile image updated successfully',
            data : updatedUser
        }
    }
}
