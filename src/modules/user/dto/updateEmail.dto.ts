import { IsEmail, IsOptional, IsString } from "class-validator";

export class EmailUpdateDto {
    
    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string
}