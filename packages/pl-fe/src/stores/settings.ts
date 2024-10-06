import { produce } from 'immer';
import { create } from 'zustand';

import { settingsSchema, type Settings } from 'pl-fe/schemas/pl-fe/settings';

import type { Emoji } from 'pl-fe/features/emoji';
import type { APIEntity } from 'pl-fe/types/entities';

const settingsSchemaPartial = settingsSchema.partial();

type State = {
  defaultSettings: Settings;
  userSettings: Partial<Settings>;

  settings: Settings;

  loadDefaultSettings: (settings: APIEntity) => void;
  loadUserSettings: (settings: APIEntity) => void;
  userSettingsSaving: () => void;
  rememberEmojiUse: (emoji: Emoji) => void;
  rememberLanguageUse: (language: string) => void;
}

const mergeSettings = (state: State) => state.settings = { ...state.defaultSettings, ...state.userSettings };

const useSettingsStore = create<State>((set) => ({
  defaultSettings: settingsSchema.parse({}),
  userSettings: {},

  settings: settingsSchema.parse({}),

  loadDefaultSettings: (settings: APIEntity) => set(produce((state: State) => {
    if (typeof settings !== 'object') return;

    state.defaultSettings = settingsSchema.parse(settings);
    mergeSettings(state);
  })),

  loadUserSettings: (settings?: APIEntity) => set(produce((state: State) => {
    if (typeof settings !== 'object') return;

    state.userSettings = settingsSchemaPartial.parse(settings);
    mergeSettings(state);
  })),

  userSettingsSaving: () => set(produce((state: State) => {
    state.userSettings.saved = true;

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

