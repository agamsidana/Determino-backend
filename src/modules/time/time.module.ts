import { Module } from '@nestjs/common';
import { TimeController } from './time.controller';

@Module({
  providers: [],
  controllers: [TimeController]
})
export class TimeModule {}
