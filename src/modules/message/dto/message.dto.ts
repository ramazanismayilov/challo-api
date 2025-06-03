import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
    @Type()
    @IsString()
    content: string;

    @Type()
    @IsString()
    @IsOptional()
    @IsUUID('4', { each: true })
    mediaId?: string;
}