import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Controller('user')
export class UserController {
    @Get()
    getUser() {
        return [ {
            name : 'Ayush Pan',id : 1 
        },
    {
        name : 'hello ', id : 2 
    }];
    }
}
