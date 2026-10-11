import { Controller,Get , Post  } from '@nestjs/common';
import CreateContactDto from './dto/create-contact.dto';

@Controller('contact')          // here contact is the path / route or endpoint for this controller
export class ContactController {
    @Post()
    create(@Body() createContactDto: CreateContactDto) {
    }
}
}
