-- Initial data. Idempotent: safe to run multiple times.
-- Run after migrations: npm run db:seed

BEGIN;

-- IDs 1-4 match operation_type_id from the case spec.
-- Sign convention: purchases and withdrawals are negative, credits are positive.
INSERT INTO transaction_types (id, code, display_code, description)
VALUES
  (1, 'purchase',                   'Normal Purchase',            'Card purchase. Negative amount.'),
  (2, 'purchase_with_installments', 'Purchase with installments', 'Card purchase split in installments. Negative amount.'),
  (3, 'withdraw',                   'Withdrawal',                 'Cash withdrawal. Negative amount.'),
  (4, 'credit_voucher',             'Credit Voucher',             'Credit granted to the customer. Positive amount.'),
  (5, 'deposit',                    'Deposit',                    'Funds added by the customer. Positive amount.')
ON CONFLICT (id) DO NOTHING;

-- Fixed IDs so they can be referenced from code, tests and docs.
INSERT INTO accounts (id, document, document_type)
VALUES
  ('00000000-0000-7000-8000-000000000001', '11222333000181', 'CNPJ'), -- system (platform)
  ('00000000-0000-7000-8000-000000000002', '12345678900',    'CPF')   -- customer a
ON CONFLICT (id) DO NOTHING;

-- The system account is the counterparty of every customer ledger entry.
INSERT INTO system_accounts (id, account_id)
VALUES
  ('00000000-0000-7000-8000-000000000001', '00000000-0000-7000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

COMMIT;
