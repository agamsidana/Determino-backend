import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepMateConnectionEntity } from './entities/prepmate-connection.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([PrepMateConnectionEntity]),UserModule],
  providers: [ConnectionService],
  controllers: [ConnectionController]
})
export class ConnectionModule {}
