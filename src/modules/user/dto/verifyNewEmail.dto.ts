import { IsEmail, IsNumber, IsString } from "class-validator";

export class VerifyNewEmailDto{
    @IsEmail()
    @IsString()
    email: string

    @IsNumber()
    otpCode: number
}