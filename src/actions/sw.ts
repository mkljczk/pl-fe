/** Sets the ServiceWorker updating state. */
const SW_UPDATING = 'SW_UPDATING' as const;

/** Dispatch when the ServiceWorker is being updated to display a loading screen. */
const setSwUpdating = (isUpdating: boolean) => ({
  type: SW_UPDATING,
  isUpdating,
});

type SwAction = ReturnType<typeof setSwUpdating>;

export {
  SW_UPDATING,
  setSwUpdating,
  type SwAction,
};
