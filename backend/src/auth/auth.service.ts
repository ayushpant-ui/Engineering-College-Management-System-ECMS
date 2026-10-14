import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {AuthLoginDto} from './dto/authlogin.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async studentLogin(dto: AuthLoginDto){
        //finding student using registration number 
        const student = await this.prisma.student.findUnique({
            where: {
                registrationNumber : dto.registrationNumber
            },
            include: {
                account: true,
            },
        });

        //checking whether student registration number exists or not
        if(!student || !student.account){
            throw new Error('Invalid registration number or password');
        }

        //comparing the frontend password with the hashed  password store in database
        const checkpassword = await bcrypt.compare(
            dto.password,
            student.account.hashPassword
        );
        // if the password is incorrect 
        if(!checkpassword){
            throw new Error('Invalid registration number or password');
        }

        
    }

    

}
