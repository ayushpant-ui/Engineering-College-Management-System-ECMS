import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {CreateContactDTO} from '@/contact/dto/createcontact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createcontactDto: CreateContactDTO) {
    return await this.prisma.contact.create({
      data: {
        fullName: createcontactDto.fullName,
        email: createcontactDto.email,
        subject: createcontactDto.subject,
        message: createcontactDto.message,
      },
    });
  }
  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
