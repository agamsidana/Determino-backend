import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ContactEntity])],
  providers: [ContactService],
  controllers: [ContactController]
})
export class ContactModule {}
