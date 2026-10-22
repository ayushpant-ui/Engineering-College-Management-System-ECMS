import {IsString, IsEmail, IsNotEmpty, MinLength} from 'class-validator';

export class AuthLoginDto {
    // @IsString()
    // @IsNotEmpty()
    // email!: string ; 

    @IsString()
    @IsNotEmpty()
    registrationNumber!: string ; 

    @IsString()
    @IsNotEmpty()
    password!: string;

}