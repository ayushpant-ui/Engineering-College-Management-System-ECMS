import {IsString, IsEmail,IsEnum, IsEmpty, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export enum ContactSubject{
  Admission = "Admission",
  Academics = "Academics",
  Departments = "Departments",
  StudentServices = "Student Services",
  GeneralInquiry = "General Inquiry",
}

export class CreateContactDTO { 

  @IsString()
  @IsEmpty()
  @MinLength(2)
  @MaxLength(50)
  fullName! : string ;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  email! : string ; 

  @IsEnum(ContactSubject)
  subject! : ContactSubject ;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  message! : string ; 
}