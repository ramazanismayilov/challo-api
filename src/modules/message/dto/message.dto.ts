import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
    @Type()
    @IsString()
    text: string;

    @Type()
    @IsString()
    @IsOptional()
    mediaId?: string;
}