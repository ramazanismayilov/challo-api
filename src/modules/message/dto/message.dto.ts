import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsOptional()
    text?: string;

    @IsUUID()
    @IsOptional()
    mediaId?: string;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) { }