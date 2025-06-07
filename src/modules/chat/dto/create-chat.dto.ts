import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateChatDto {
    @Type()
    @IsInt()
    userId: number;

    @Type()
    @IsString()
    @IsOptional()
    message: string;

    @Type()
    @IsOptional()
    @IsUUID()
    mediaId?: string;
}