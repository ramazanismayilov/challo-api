import { IsString, Length } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    @Length(6, 12)
    currentPassword: string;

    @IsString()
    @Length(6, 12)
    newPassword: string;

    @IsString()
    @Length(6, 12)
    repeatPassword: string;
}