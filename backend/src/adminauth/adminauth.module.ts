import { Module } from '@nestjs/common';
import { AdminauthController } from './adminauth.controller';
import { AdminauthService } from './adminauth.service';

@Module({
  controllers: [AdminauthController],
  providers: [AdminauthService]
})
export class AdminauthModule {}
