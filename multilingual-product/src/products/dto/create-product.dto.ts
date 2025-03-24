import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';
import { LanguageCode } from '../enums/language.enum';

export class CreateProductDto {
    @IsString()
    sku: string;

    @ValidateNested({ each: true })
    @Type(() => CreateProductTranslationDto)
    @ArrayMinSize(1)
    translations: CreateProductTranslationDto[];
}

export class CreateProductTranslationDto {
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
