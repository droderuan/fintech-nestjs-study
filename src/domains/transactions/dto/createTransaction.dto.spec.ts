import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './createTransaction.dto';

const valid = {
  account_id: '0195f1a2-0000-7000-8000-000000000001',
  type: 'credit_voucher',
  amount: 123.45,
};

const errorsFor = async (body: object) =>
  (await validate(plainToInstance(CreateTransactionDto, body))).map(
    (e) => e.property,
  );

describe('CreateTransactionDto', () => {
  it('should accept a valid payload', async () => {
    expect(await errorsFor(valid)).toHaveLength(0);
  });

  it.each([
    ['account_id', 1],
    ['account_id', 'not-a-uuid'],
    ['type', 4],
    ['type', 'CREDIT_VOUCHER'],
    ['type', 'unknown'],
    ['amount', 0],
    ['amount', -10],
    ['amount', 1.234],
    ['amount', '123.45'],
    ['amount', 10_000_000_000_000],
  ])('should reject %s = %j', async (field, value) => {
    expect(await errorsFor({ ...valid, [field]: value })).toEqual([field]);
  });
});
