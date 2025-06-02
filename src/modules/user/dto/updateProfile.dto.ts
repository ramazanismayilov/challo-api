import { Type } from "class-transformer";
import { IsOptional, IsString, Length } from "class-validator";
export class ProfileUpdateDto {
    @Type()
    @IsString()
    @IsOptional()
    @Length(3, 20)
    displayName?: string

    @Type()
    @IsString()
    @IsOptional()
    avatarId?: string

    @Type()
    @IsString()
    @IsOptional()
    about?: string
}