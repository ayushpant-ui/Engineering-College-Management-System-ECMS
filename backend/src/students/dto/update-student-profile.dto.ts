import {BadRequestException} from '@nestjs/common';

export function validateImageFile(file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('Profile Image file is required');
    }
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WEBP are allowed');
}

const MaxSize = 2 * 1024 * 1024; // 2MB

if(file.size > MaxSize) {
    throw new BadRequestException('File size exceeds the maximum limit of 2MB');
}

