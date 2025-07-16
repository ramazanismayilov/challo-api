import { Body, Controller, Get, Param, Post } from "@nestjs/common";
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

    @Get('getStatusesForViewer/:userId')
    @Auth(UserRole.ADMIN, UserRole.USER)
    getUserStatuses(@Param('userId') userId: number) {
        return this.statusService.getUserStatuses(userId);
    }

    @Post()
    createChat(@Body() body: CreateStatusDto) {
        return this.statusService.createStatus(body);
    }
}