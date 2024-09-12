import { usePlFeConfig } from './usePlFeConfig';
import { useSettings } from './useSettings';
import { useTheme } from './useTheme';

const useLogo = () => {
  const { logo, logoDarkMode } = usePlFeConfig();
  const { demo } = useSettings();

  const darkMode = ['dark', 'black'].includes(useTheme());

  // Use the right logo if provided, otherwise return null;
  const src = (darkMode && logoDarkMode)
    ? logoDarkMode
    : logo || logoDarkMode;

  if (demo) return null;

  return src;
};

export { useLogo };
