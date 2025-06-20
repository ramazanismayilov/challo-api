import { IsEmail, IsString } from "class-validator";

export class ResentOtpDto {
    @IsString()
    @IsEmail()
    email: string
}