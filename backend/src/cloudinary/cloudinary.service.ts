import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {v2 as cloudinary} from 'cloudinary';
import {BadRequestException} from '@nestjs/common';

@Injectable()
export class CloudinaryService {
    constructor(){
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

 async uploadImage(file: Express.Multer.File) {
    try {
      return await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecms/students',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch {
      throw new InternalServerErrorException(
        'Image upload failed',
      );
    }
  }

  async deleteImage(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      throw new InternalServerErrorException(
        'Unable to delete previous image',
      );
    }
  }
}