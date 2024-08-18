import {
  AdminAccountRecord,
  AdminReportRecord,
} from 'soapbox/normalizers';

type AdminAccount = ReturnType<typeof AdminAccountRecord>;
type AdminReport = ReturnType<typeof AdminReportRecord>;

// Utility types
type APIEntity = Record<string, any>;
type EmbeddedEntity<T extends object> = null | string | T;

export {
  AdminAccount,
  AdminReport,

  // Utility types
  APIEntity,
  EmbeddedEntity,
};
