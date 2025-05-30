import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/common/decorators/auth.decorator";
import { UserRole } from "src/common/enums/role.enum";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get(':id')
    @Auth(UserRole.ADMIN)
    getUser(@Param('id') id: number) {
        return this.userService.getUser(id)
    }
}