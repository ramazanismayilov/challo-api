import { IsOptional, IsString, IsUUID, Length } from "class-validator";
export class ProfileUpdateDto {
    @IsString()
    @IsOptional()
    @Length(3, 20)
    displayName?: string

    @IsUUID()
    @IsOptional()
    avatarId?: string

    @IsString()
    @IsOptional()
    about?: string
}