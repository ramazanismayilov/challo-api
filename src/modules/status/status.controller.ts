import { Body, Controller, Get, Post } from "@nestjs/common";
import { Auth } from "src/common/decorators/auth.decorator";
import { StatusService } from "./status.service";
import { CreateStatusDto } from "./dto/status.dto";
import { UserRole } from "src/common/enums/role.enum";

@Auth()
@Controller('status')
export class StatusController {
    constructor(private statusService: StatusService) { }

    @Get()
    @Auth(UserRole.ADMIN)
    getAllStatuses() {
        return this.statusService.getAllStatuses();
    }

    @Get('getStatusesForViewer')
    @Auth(UserRole.ADMIN, UserRole.USER)
    getStatusesForViewer() {
        return this.statusService.getStatusesForViewer();
    }

    @Post()
    createChat(@Body() body: CreateStatusDto) {
        return this.statusService.createStatus(body);
    }
}