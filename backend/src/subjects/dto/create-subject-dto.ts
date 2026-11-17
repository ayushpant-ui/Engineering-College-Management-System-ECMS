import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';
import { SubjectComponentType } from '@prisma/client';
export class CreateSubjectDto {
    
    @IsString()
    @IsNotEmpty()
    code! : string ; 

    @IsString()
    @IsNotEmpty()
    name! : string ; 

    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(SubjectComponentType,{each: true})
    components! : SubjectComponentType[]
}