import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { VerifyOtpDto } from "./dto/verify.dto";
import { LoginDto } from "./dto/login.dto";
import { ResentOtpDto } from "./dto/resent-otp.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Auth } from "src/common/decorators/auth.decorator";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body)
    }

    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body)
    }

    @Post('verifyOtp')
    verifyOtp(@Body() body: VerifyOtpDto) {
        return this.authService.verifyOtp(body)
    }

    @Post('resentOtp')
    resendOtp(@Body() body: ResentOtpDto) {
        return this.authService.resendOtp(body)
    }

    @Post('refresh-token')
    refreshToken(@Body() body: RefreshTokenDto) {
        return this.authService.refreshToken(body);
    }

    @Post('reset-password')
    @Auth()
    resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body)
    }

    @Get('verify-token/:token')
    verify(@Param('token') token: string) {
        return this.authService.verifyToken(token);
    }
}