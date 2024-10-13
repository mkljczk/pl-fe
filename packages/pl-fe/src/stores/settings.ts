import { produce } from 'immer';
import * as v from 'valibot';
import { create } from 'zustand';

import { settingsSchema, type Settings } from 'pl-fe/schemas/pl-fe/settings';

import type { Emoji } from 'pl-fe/features/emoji';
import type { APIEntity } from 'pl-fe/types/entities';

const settingsSchemaPartial = v.partial(settingsSchema);

type State = {
  defaultSettings: Settings;
  userSettings: Partial<Settings>;

  settings: Settings;

  loadDefaultSettings: (settings: APIEntity) => void;
  loadUserSettings: (settings: APIEntity) => void;
  userSettingsSaving: () => void;
  changeSetting: (path: string[], value: any) => void;
  rememberEmojiUse: (emoji: Emoji) => void;
  rememberLanguageUse: (language: string) => void;
}

const changeSetting = (object: APIEntity, path: string[], value: any) => {
  if (path.length === 1) {
    object[path[0]] = value;
    return;
  }

  if (typeof object[path[0]] !== 'object') object[path[0]] = {};
  return changeSetting(object[path[0]], path.slice(1), value);
};

const mergeSettings = (state: State) => state.settings = { ...state.defaultSettings, ...state.userSettings };

const useSettingsStore = create<State>((set) => ({
  defaultSettings: v.parse(settingsSchema, {}),
  userSettings: {},

  settings: v.parse(settingsSchema, {}),

  loadDefaultSettings: (settings: APIEntity) => set(produce((state: State) => {
    if (typeof settings !== 'object') return;

    state.defaultSettings = v.parse(settingsSchema, settings);
    mergeSettings(state);
  })),

  loadUserSettings: (settings?: APIEntity) => set(produce((state: State) => {
    if (typeof settings !== 'object') return;

    state.userSettings = v.parse(settingsSchemaPartial, settings);
    mergeSettings(state);
  })),

  userSettingsSaving: () => set(produce((state: State) => {
    state.userSettings.saved = true;

    mergeSettings(state);
  })),

  changeSetting: (path: string[], value: any) => set(produce((state: State) => {
    changeSetting(state.userSettings, path, value);

    mergeSettings(state);
  })),

  rememberEmojiUse: (emoji: Emoji) => set(produce((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedEmojis) settings.frequentlyUsedEmojis = {};

    settings.frequentlyUsedEmojis[emoji.id] = (settings.frequentlyUsedEmojis[emoji.id] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  })),

  rememberLanguageUse: (language: string) => set(produce((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedLanguages) settings.frequentlyUsedLanguages = {};

    settings.frequentlyUsedLanguages[language] = (settings.frequentlyUsedLanguages[language] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  })),
}));

export { useSettingsStore };

