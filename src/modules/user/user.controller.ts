import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/common/decorators/auth.decorator";
import { UserRole } from "src/common/enums/role.enum";
import { ProfileUpdateDto } from "./dto/updateProfile.dto";
import { EmailUpdateDto } from "./dto/updateEmail.dto";
import { VerifyNewEmailDto } from "./dto/verifyNewEmail.dto";
import { SearchDto } from "src/common/dto/search.dto";
import { ApiQuery } from "@nestjs/swagger";

@Auth()
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    @Auth(UserRole.ADMIN)
    getUsers() {
        return this.userService.getUsers()
    }

    @Get('chatUsers')
    @Auth(UserRole.ADMIN, UserRole.USER)
    getChatUsers(@Query() query: SearchDto) {
        return this.userService.getChatUsers(query);
    }

    @Get('chatUsers/:id')
    @Auth(UserRole.ADMIN, UserRole.USER)
    getChatUserId(@Param('id') id: number) {
        return this.userService.getChatUserId(id)
    }

    @Get('myProfile')
    getMyProfile() {
        return this.userService.getMyProfile()
    }

    @Get(':id')
    @Auth(UserRole.ADMIN)
    getUser(@Param('id') id: number) {
        return this.userService.getUser(id)
    }

    @Post('updateProfile')
    async updateProfile(@Body() body: ProfileUpdateDto) {
        return this.userService.updateProfile(body);
    }

    @Post('updateEmail')
    async updateEmail(@Body() body: EmailUpdateDto) {
        return this.userService.updateEmail(body);
    }

    @Post('verifyNewEmail')
    async verifyNewEmail(@Body() body: VerifyNewEmailDto) {
        return this.userService.verifyNewEmail(body);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        return this.userService.deleteUser(id);
    }
}