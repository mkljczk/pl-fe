import type { Account } from '../normalizers/normalizeAccount';

const minifyAccount = ({ moved, ...account }: Account) => ({
  ...account,
  moved_id: moved?.id || null,
});

type MinifiedAccount = ReturnType<typeof minifyAccount>;

export { minifyAccount, type MinifiedAccount };
