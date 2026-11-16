import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    code! : string ; 

    @IsString()
    @IsNotEmpty()
    name! : string ; 
}