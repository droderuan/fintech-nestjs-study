import { IsEnum, IsNumber, IsPositive, IsUUID, Max } from 'class-validator';
import { TransactionType } from '../../../infra/database/typeorm/models';

export class CreateTransactionDto {
  @IsUUID()
  account_id: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(9_999_999_999_999.99)
  amount: number;
}
