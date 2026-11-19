import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject-dto';
import { UpdateSubjectDTO } from './dto/update-subject-dto';
@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

async createSubject(dto: CreateSubjectDto) {
  const subject = await this.prisma.subject.create({
    data: {
      code: dto.code,
      name: dto.name,

      components: {
        create: dto.components.map((type) => ({
          type,
        })),
      },
    },
    include: {
      components: true,
    },
  });

  return {
    message: 'Subject created successfully',
    data: {
      subject,
      components: subject.components.map(
        (component) => component.type,
      ),
      curriculaCount: 0,
    },
  };
}

async getAllSubjects() {
  const subjects = await this.prisma.subject.findMany({
    select: {
      id: true,
      code: true,
      name: true,

      components: {
        select: {
          type: true,
        },
      },

      _count: {
        select: {
          curricula: true,
        },
      },
    },
    orderBy: {
      code: 'asc',
    },
  });

  return {
    message: 'Subjects retrieved successfully',
    data: subjects.map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,

      components: subject.components.map(
        (component) => component.type,
      ),

      curriculaCount: subject._count.curricula,
    })),
  };
}

async deleteSubject(id:number){
    await this.prisma.subject.delete({
        where:{
            id:id
        }
    })
    return{
        message:`Subject of id:${id} deleted Successfully`
    }
}

async updateSubject(id:number,dto:UpdateSubjectDTO){
  const subject = await this.prisma.subject.update({
    where:{
      id
    },
    data: {
      ...(dto.code!== undefined) && {code : dto.code} , 
      ...(dto.name!== undefined ) && {name : dto.name} , 
      

      ...(dto.components!== undefined) && {components: {
        deleteMany: {} ,
        create : dto.components.map((type)=> ({
          type,
        })),
      }
      }
    },
      include:{
        components:true
    },
  });

  return {
    message : `Successfully Updated Subject${id}`,
    data : subject
  }
}
}
