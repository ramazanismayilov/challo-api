import { IsEmail, IsString, Length } from "class-validator";

export class RegisterDto {
    @IsString()
    @Length(3, 20)
    displayName: string

    @IsString()
    @IsEmail()
    email: string

    @IsString()
    @Length(6, 12)
    password: string;

    @IsString()
    @Length(6, 12)
    confirmPassword: string;
}