import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class StatusDto {
    @IsString()
    @IsOptional()
    text?: string;

    @IsOptional()
    @IsUUID()
    mediaId?: string;
}

export class CreateStatusDto extends PartialType(StatusDto) { }