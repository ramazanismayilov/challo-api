import { Type } from "class-transformer";
import { IsArray, IsNumber } from "class-validator";

export class DeleteChatDto {
    @Type(() => Number)
    @IsArray()
    @IsNumber({}, { each: true })
    chatIds: number[];
}