import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
    @Type()
    @IsString()
    @IsOptional()
    text?: string;

    @Type()
    @IsUUID()
    @IsOptional()
    mediaId?: string;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) { }