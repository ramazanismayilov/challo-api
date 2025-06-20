import { IsEmail, IsNumber, IsString } from "class-validator";

export class VerifyOtpDto {
    @IsString()
    @IsEmail()
    email: string

    @IsNumber()
    otpCode: number
}