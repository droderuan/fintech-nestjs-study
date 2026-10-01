import { IsInt, IsPositive, IsUUID, Max } from 'class-validator';

export class DischargeTransactionDto {
  /** @example 00000000-0000-7000-8000-000000000002 */
  @IsUUID()
  account_id: string;

  /**
   * Positive integer cents to pay, applied to debits oldest first.
   * @example 10000
   */
  @IsInt()
  @IsPositive()
  @Max(999_999_999_999_999)
  amount: number;
}
