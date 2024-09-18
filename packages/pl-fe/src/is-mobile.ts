/** Breakpoint at which the application is considered "mobile". */
const LAYOUT_BREAKPOINT = 630;

/** Check if the width is small enough to be considered "mobile". */
const isMobile = (width: number) => width <= LAYOUT_BREAKPOINT;

/** Whether the device is iOS (best guess). */
const iOS: boolean =
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const userTouching = window.matchMedia('(pointer: coarse)');

/** Whether the device is iOS (best guess). */
const isIOS = (): boolean => iOS;

export { isMobile, userTouching, isIOS };
