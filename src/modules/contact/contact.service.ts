import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {

    constructor(@InjectRepository(ContactEntity) private readonly contactRepository:Repository<ContactEntity>){}

    async contact(dto:ContactDto){

        const {name,email,topic,subject,message} = dto;

        const contact = this.contactRepository.create({
            name,
            email,
            topic,
            subject,
            message
        });

        const savedContact = await this.contactRepository.save(contact);

        return {
            data:{
                success:true
            }
        }

    }

}
