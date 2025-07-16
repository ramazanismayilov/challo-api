import { Body, Controller, Post } from "@nestjs/common";
import { Auth } from "src/common/decorators/auth.decorator";
import { StatusService } from "./status.service";
import { CreateStatusDto } from "./dto/status.dto";

@Auth()
@Controller('status')
export class StatusController {
    constructor(private statusService: StatusService) { }

    @Post()
    createChat(@Body() body: CreateStatusDto) {
        return this.statusService.createStatus(body);
    }
}