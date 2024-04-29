import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';
import trimStart from 'lodash/trimStart';

import { normalizeUsername } from 'soapbox/utils/input';
import { toTailwind } from 'soapbox/utils/tailwind';
import { generateAccent } from 'soapbox/utils/theme';

import type {
  PromoPanelItem,
  FooterItem,
  CryptoAddress,
} from 'soapbox/types/soapbox';

const DEFAULT_COLORS = ImmutableMap<string, any>({
  success: ImmutableMap({
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  }),
  danger: ImmutableMap({
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  }),
  'greentext': '#789922',
});

export const PromoPanelItemRecord = ImmutableRecord({
  icon: '',
  text: '',
  url: '',
  textLocales: ImmutableMap<string, string>(),
});

export const PromoPanelRecord = ImmutableRecord({
  items: ImmutableList<PromoPanelItem>(),
});

export const FooterItemRecord = ImmutableRecord({
  title: '',
  url: '',
});

export const CryptoAddressRecord = ImmutableRecord({
  address: '',
  note: '',
  ticker: '',
});

export const SoapboxConfigRecord = ImmutableRecord({
  appleAppId: null,
  authProvider: '',
  logo: '',
  logoDarkMode: null,
  banner: '',
  brandColor: '', // Empty
  accentColor: '',
  colors: ImmutableMap(),
  copyright: `♥${new Date().getFullYear()}. Copying is an act of love. Please copy and share.`,
  customCss: ImmutableList<string>(),
  defaultSettings: ImmutableMap<string, any>(),
  extensions: ImmutableMap(),
  gdpr: false,
  gdprUrl: '',
  greentext: false,
  promoPanel: PromoPanelRecord(),
  navlinks: ImmutableMap({
    homeFooter: ImmutableList<FooterItem>(),
  }),
  allowedEmoji: ImmutableList<string>([
    '👍',
    '❤️',
    '😆',
    '😮',
    '😢',
    '😩',
  ]),
  verifiedIcon: '',
  verifiedCanEditName: false,
  displayFqn: true,
  cryptoAddresses: ImmutableList<CryptoAddress>(),
  cryptoDonatePanel: ImmutableMap({
    limit: 1,
  }),
  aboutPages: ImmutableMap<string, ImmutableMap<string, unknown>>(),
  authenticatedProfile: false,
  linkFooterMessage: '',
  links: ImmutableMap<string, string>(),
  displayCta: false,
  /** Whether to inject suggested profiles into the Home feed. */
  feedInjection: true,
  tileServer: '',
  tileServerAttribution: '',
  redirectRootNoLogin: '',
  /**
   * Whether to use the preview URL for media thumbnails.
   * On some platforms this can be too blurry without additional configuration.
   */
  mediaPreview: false,
  sentryDsn: undefined as string | undefined,
}, 'SoapboxConfig');

type SoapboxConfigMap = ImmutableMap<string, any>;

const normalizeCryptoAddress = (address: unknown): CryptoAddress => {
  return CryptoAddressRecord(ImmutableMap(fromJS(address))).update('ticker', ticker => {
    return trimStart(ticker, '$').toLowerCase();
  });
};

const normalizeCryptoAddresses = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const addresses = ImmutableList(soapboxConfig.get('cryptoAddresses'));
  return soapboxConfig.set('cryptoAddresses', addresses.map(normalizeCryptoAddress));
};

const normalizeBrandColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.get('brandColor') || soapboxConfig.getIn(['colors', 'primary', '500']) || '';
  return soapboxConfig.set('brandColor', brandColor);
};

const normalizeAccentColor = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const brandColor = soapboxConfig.get('brandColor');

  const accentColor = soapboxConfig.get('accentColor')
    || soapboxConfig.getIn(['colors', 'accent', '500'])
    || (brandColor ? generateAccent(brandColor) : '');

  return soapboxConfig.set('accentColor', accentColor);
};

const normalizeColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const colors = DEFAULT_COLORS.mergeDeep(soapboxConfig.get('colors'));
  return toTailwind(soapboxConfig.set('colors', colors));
};

const maybeAddMissingColors = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const colors = soapboxConfig.get('colors');

  const missing = ImmutableMap({
    'gradient-start': colors.getIn(['primary', '500']),
    'gradient-end': colors.getIn(['accent', '500']),
    'accent-blue': colors.getIn(['primary', '600']),
  });

  return soapboxConfig.set('colors', missing.mergeDeep(colors));
};

const normalizePromoPanel = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const promoPanel = PromoPanelRecord(soapboxConfig.get('promoPanel'));
  const items = promoPanel.items.map(PromoPanelItemRecord);
  return soapboxConfig.set('promoPanel', promoPanel.set('items', items));
};

const normalizeFooterLinks = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const path = ['navlinks', 'homeFooter'];
  const items = (soapboxConfig.getIn(path, ImmutableList()) as ImmutableList<any>).map(FooterItemRecord);
  return soapboxConfig.setIn(path, items);
};

/** Single user mode is now managed by `redirectRootNoLogin`. */
const upgradeSingleUserMode = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const singleUserMode = soapboxConfig.get('singleUserMode') as boolean | undefined;
  const singleUserModeProfile = soapboxConfig.get('singleUserModeProfile') as string | undefined;
  const redirectRootNoLogin = soapboxConfig.get('redirectRootNoLogin') as string | undefined;

  if (!redirectRootNoLogin && singleUserMode && singleUserModeProfile) {
    return soapboxConfig
      .set('redirectRootNoLogin', `/@${normalizeUsername(singleUserModeProfile)}`)
      .deleteAll(['singleUserMode', 'singleUserModeProfile']);
  } else {
    return soapboxConfig
      .deleteAll(['singleUserMode', 'singleUserModeProfile']);
  }
};

/** Ensure a valid path is used. */
const normalizeRedirectRootNoLogin = (soapboxConfig: SoapboxConfigMap): SoapboxConfigMap => {
  const redirectRootNoLogin = soapboxConfig.get('redirectRootNoLogin');

  if (!redirectRootNoLogin) return soapboxConfig;

  try {
    // Basically just get the pathname with a leading slash.
    const normalized = new URL(redirectRootNoLogin, 'http://a').pathname;

    if (normalized !== '/') {
      return soapboxConfig.set('redirectRootNoLogin', normalized);
    } else {
      // Prevent infinite redirect(?)
      return soapboxConfig.delete('redirectRootNoLogin');
    }
  } catch (e) {
    console.error('You have configured an invalid redirect in Soapbox Config.');
    console.error(e);
    return soapboxConfig.delete('redirectRootNoLogin');
  }
};

export const normalizeSoapboxConfig = (soapboxConfig: Record<string, any>) => {
  return SoapboxConfigRecord(
    ImmutableMap(fromJS(soapboxConfig)).withMutations(soapboxConfig => {
      normalizeBrandColor(soapboxConfig);
      normalizeAccentColor(soapboxConfig);
      normalizeColors(soapboxConfig);
      normalizePromoPanel(soapboxConfig);
      normalizeFooterLinks(soapboxConfig);
      maybeAddMissingColors(soapboxConfig);
      normalizeCryptoAddresses(soapboxConfig);
      upgradeSingleUserMode(soapboxConfig);
      normalizeRedirectRootNoLogin(soapboxConfig);
    }),
  );
};
