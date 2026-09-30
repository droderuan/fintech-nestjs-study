import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../../../infra/database/typeorm/models';

export class CreateAccountDto {
  /**
   * Document number, letters and digits only.
   * @example 12345678900
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'document must contain only letters and digits',
  })
  document: string;

  /**
   * Defaults to CPF.
   * @example CPF
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DocumentType)
  document_type: DocumentType = DocumentType.CPF;
}
