export class DischargedTransactionDto {
  /** @example 0199a0c5-1d2e-7f3a-8b4c-6d7e8f9a0b1c */
  transaction_id: string;

  /**
   * Integer cents of this debit settled by the discharge.
   * @example 1350
   */
  amount: number;
}

export class DischargeResponseDto {
  /** @example 00000000-0000-7000-8000-000000000002 */
  account_id: string;

  /**
   * Integer cents received in the request.
   * @example 10000
   */
  amount: number;

  /**
   * Integer cents not applied because no debit was left outstanding.
   * @example 6780
   */
  remaining_amount: number;

  /** Debits settled, oldest first. */
  discharged: DischargedTransactionDto[];

  static fromDischarge(discharge: {
    accountId: string;
    amount: number;
    remainingAmount: number;
    discharged: { transactionId: string; amount: number }[];
  }): DischargeResponseDto {
    return {
      account_id: discharge.accountId,
      amount: discharge.amount,
      remaining_amount: discharge.remainingAmount,
      discharged: discharge.discharged.map(({ transactionId, amount }) => ({
        transaction_id: transactionId,
        amount,
      })),
    };
  }
}
