import { Controller, Get } from "@nestjs/common";
import { NoticesService } from "./notices.service";

// Public endpoint used by the website's Notices page.
@Controller("notices")
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  findPublic() {
    return this.noticesService.findPublic();
  }
}