import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { DocumentType } from '../../../infra/database/typeorm/models';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'document must contain only letters and digits',
  })
  document: string;

  @IsOptional()
  @IsEnum(DocumentType)
  document_type: DocumentType = DocumentType.CPF;
}
