import { Controller,Get , Post,Body  } from '@nestjs/common';
import {CreateContactDTO} from './dto/createcontact.dto';
import {ContactService} from './contact.service';

@Controller('contact')          // here contact is the path / route or endpoint for this controller
export class ContactController {
    constructor(private readonly contactService: ContactService) {}     // object of contactService is created and injected into the controller class
    @Post()
  async create(@Body() createContactDto: CreateContactDTO) {   // @Body() decorator is used to extract the body of the request and map it to the createContactDto object
    return this.contactService.create(createContactDto);
  }

  @Get()
  async findAll() {
    return this.contactService.findAll();
  }
}


