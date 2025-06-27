import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
    @IsOptional()
    @IsString()
    search?: string;
}