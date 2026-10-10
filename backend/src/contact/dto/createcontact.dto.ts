import {IsString, IsEmail, IsOptional, IsPhoneNumber, IsEmpty, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class CreateContactDTO { 

  @IsString()
  @IsEmpty()
  @MinLength(2)
  @MaxLength(50)
  Fullname : string ;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  email : string ; 

  @IsString()
  @MinLength(10)
  @MaxLength(100)
  message : string ; 
}