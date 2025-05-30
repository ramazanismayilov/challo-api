import { Type } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";

export class RegisterDto {
    @Type()
    @IsString()
    @IsEmail()
    email: string

    @Type()
    @IsString()
    @Length(6, 12)
    password: string;
}