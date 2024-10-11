import { useSettingsStore } from 'pl-fe/stores';

/** Get the user settings from the store */
const useSettings = () => useSettingsStore().settings;

export { useSettings };
