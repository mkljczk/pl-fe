import { Map as ImmutableMap, fromJS } from 'immutable';

import tintify from 'pl-fe/utils/colors';
import { generateAccent, generateNeutral } from 'pl-fe/utils/theme';

import type { TailwindColorPalette } from 'pl-fe/types/colors';

type PlFeConfig = ImmutableMap<string, any>;
type PlFeColors = ImmutableMap<string, any>;

/** Check if the value is a valid hex color */
const isHex = (value: any): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(value);

/** Expand hex colors into tints */
const expandPalette = (palette: TailwindColorPalette): TailwindColorPalette => {
  // Generate palette only for present colors
  return Object.entries(palette).reduce(
    (result: TailwindColorPalette, colorData) => {
      const [colorName, color] = colorData;

      // Conditionally handle hex color and Tailwind color object
      if (typeof color === 'string' && isHex(color)) {
        result[colorName] = tintify(color);
      } else if (color && typeof color === 'object') {
        result[colorName] = color;
      }

      return result;
    },
    {},
  );
};

// Generate accent color only if brandColor is present
const maybeGenerateAccentColor = (brandColor: any): string | null =>
  isHex(brandColor) ? generateAccent(brandColor) : null;

/** Build a color object from legacy colors */
const fromLegacyColors = (plFeConfig: PlFeConfig): TailwindColorPalette => {
  const brandColor = plFeConfig.get('brandColor');
  const accentColor = plFeConfig.get('accentColor');
  const accent = isHex(accentColor)
    ? accentColor
    : maybeGenerateAccentColor(brandColor);

  return expandPalette({
    primary: isHex(brandColor) ? brandColor : null,
    secondary: accent,
    accent,
    gray: (isHex(brandColor) ? generateNeutral(brandColor) : null) as any,
  });
};

/** Convert pl-fe Config into Tailwind colors */
const toTailwind = (plFeConfig: PlFeConfig): PlFeConfig => {
  const colors: PlFeColors = ImmutableMap(plFeConfig.get('colors'));
  const legacyColors = ImmutableMap(
    fromJS(fromLegacyColors(plFeConfig)),
  ) as PlFeColors;

  return plFeConfig.set('colors', legacyColors.mergeDeep(colors));
};

export { expandPalette, fromLegacyColors, toTailwind };
