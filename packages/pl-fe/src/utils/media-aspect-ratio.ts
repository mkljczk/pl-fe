const minimumAspectRatio = 9 / 16; // Portrait phone
const maximumAspectRatio = 10; // Generous min-height

const isPanoramic = (ar: number) => {
  if (isNaN(ar)) return false;
  return ar >= maximumAspectRatio;
};

const isPortrait = (ar: number) => {
  if (isNaN(ar)) return false;
  return ar <= minimumAspectRatio;
};

const isNonConformingRatio = (ar: number) => {
  if (isNaN(ar)) return false;
  return !isPanoramic(ar) && !isPortrait(ar);
};

export {
  minimumAspectRatio,
  maximumAspectRatio,
  isPanoramic,
  isPortrait,
  isNonConformingRatio,
};
