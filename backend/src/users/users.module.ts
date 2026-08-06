import { Module } from '@nestjs/common';
import { ControllerService } from './controller/controller.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [ControllerService, UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
