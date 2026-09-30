import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DocumentType } from '../../../infra/database/typeorm/models';
import { CreateAccountDto } from './createAccount.dto';

const errorsFor = async (body: object) =>
  (await validate(plainToInstance(CreateAccountDto, body))).map(
    (e) => e.property,
  );

describe('CreateAccountDto', () => {
  it('should accept the case payload and default document_type to CPF', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      document: '12345678900',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.document_type).toBe(DocumentType.CPF);
  });

  it.each([
    ['missing', {}],
    ['empty', { document: '' }],
    ['not a string', { document: 12345678900 }],
    ['with symbols', { document: '123.456.789-00' }],
    ['too long', { document: '1'.repeat(33) }],
  ])('should reject document %s', async (_, body) => {
    expect(await errorsFor(body)).toContain('document');
  });

  it('should reject an unknown document_type', async () => {
    expect(await errorsFor({ document: '123', document_type: 'RG' })).toContain(
      'document_type',
    );
  });
});
