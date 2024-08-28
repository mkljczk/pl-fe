import {
  PromoPanelItemRecord,
  FooterItemRecord,
  CryptoAddressRecord,
  PlFeConfigRecord,
} from 'pl-fe/normalizers/pl-fe/pl-fe-config';

type Me = string | null | false | undefined;

type PromoPanelItem = ReturnType<typeof PromoPanelItemRecord>;
type FooterItem = ReturnType<typeof FooterItemRecord>;
type CryptoAddress = ReturnType<typeof CryptoAddressRecord>;
type PlFeConfig = ReturnType<typeof PlFeConfigRecord>;

export {
  Me,
  PromoPanelItem,
  FooterItem,
  CryptoAddress,
  PlFeConfig,
};
