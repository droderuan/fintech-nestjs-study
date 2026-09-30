import { IsEnum, IsInt, IsPositive, IsUUID, Max } from 'class-validator';
import { TransactionType } from '../../../infra/database/typeorm/models';

export class CreateTransactionDto {
  @IsUUID()
  account_id: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  @IsPositive()
  @Max(999_999_999_999_999)
  amount: number;
}
