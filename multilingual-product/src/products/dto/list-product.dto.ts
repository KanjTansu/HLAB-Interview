import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { LanguageCode } from '../enums/language.enum';

export class ListProductDto {
    @IsString()
    search: string;

    @IsEnum(LanguageCode)
    lang: LanguageCode;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
