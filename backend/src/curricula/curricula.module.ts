import { Module } from '@nestjs/common';
import { CurriculaController } from './curricula.controller';
import { CurriculaService } from './curricula.service';

@Module({
  controllers: [CurriculaController],
  providers: [CurriculaService]
})
export class CurriculaModule {}
