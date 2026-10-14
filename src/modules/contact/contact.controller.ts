import { Body, Controller, Post } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {

    constructor(private readonly contactService:ContactService){}

    @Post()
    async contact(@Body() dto:ContactDto){
        return this.contactService.contact(dto);
    }

}
