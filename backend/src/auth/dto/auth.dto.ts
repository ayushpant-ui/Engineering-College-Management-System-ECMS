import {IsString, IsEmail, IsNotEmpty, MinLength} from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    registrationNumber!: string ; 

    @IsNotEmpty()
    @IsEmail()
    password!: string;
}