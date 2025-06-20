import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateChatDto {
    @IsInt()
    userId: number;

    @IsString()
    @IsOptional()
    text: string;

    @IsOptional()
    @IsUUID()
    mediaId?: string;
}