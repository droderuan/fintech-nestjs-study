import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DischargeTransactionDto } from './dischargeTransaction.dto';

const valid = {
  account_id: '0195f1a2-0000-7000-8000-000000000001',
  amount: 10000,
};

const errorsFor = async (body: object) =>
  (await validate(plainToInstance(DischargeTransactionDto, body))).map(
    (e) => e.property,
  );

describe('DischargeTransactionDto', () => {
  it('should accept a valid payload', async () => {
    expect(await errorsFor(valid)).toHaveLength(0);
  });

  it.each([
    ['account_id', 'not-a-uuid'],
    ['amount', 0],
    ['amount', -10],
    ['amount', 123.45],
    ['amount', '10000'],
    ['amount', 1_000_000_000_000_000],
  ])('should reject %s = %j', async (field, value) => {
    expect(await errorsFor({ ...valid, [field]: value })).toEqual([field]);
  });
});
