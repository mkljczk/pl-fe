import React, { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { updatePlFeConfig } from 'pl-fe/actions/admin';
import { getHost } from 'pl-fe/actions/instance';
import { fetchPlFeConfig } from 'pl-fe/actions/pl-fe';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import ColorPicker from 'pl-fe/features/pl-fe-config/components/color-picker';
import { useAppDispatch } from 'pl-fe/hooks/useAppDispatch';
import { useAppSelector } from 'pl-fe/hooks/useAppSelector';
import { usePlFeConfig } from 'pl-fe/hooks/usePlFeConfig';
import { normalizePlFeConfig } from 'pl-fe/normalizers/pl-fe/pl-fe-config';
import toast from 'pl-fe/toast';
import { download } from 'pl-fe/utils/download';

import Palette, { ColorGroup } from './components/palette';

import type { ColorChangeHandler } from 'react-color';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
  saved: { id: 'theme_editor.saved', defaultMessage: 'Theme updated!' },
  restore: { id: 'theme_editor.restore', defaultMessage: 'Restore default theme' },
  export: { id: 'theme_editor.export', defaultMessage: 'Export theme' },
  import: { id: 'theme_editor.import', defaultMessage: 'Import theme' },
  importSuccess: { id: 'theme_editor.import_success', defaultMessage: 'Theme was successfully imported!' },
  colorPrimary: { id: 'theme_editor.colors.primary', defaultMessage: 'Primary' },
  colorSecondary: { id: 'theme_editor.colors.secondary', defaultMessage: 'Secondary' },
  colorAccent: { id: 'theme_editor.colors.accent', defaultMessage: 'Accent' },
  colorGray: { id: 'theme_editor.colors.gray', defaultMessage: 'Gray' },
  colorSuccess: { id: 'theme_editor.colors.success', defaultMessage: 'Success' },
  colorDanger: { id: 'theme_editor.colors.danger', defaultMessage: 'Danger' },
  colorGreentext: { id: 'theme_editor.colors.greentext', defaultMessage: 'Greentext' },
  colorAccentBlue: { id: 'theme_editor.colors.accent_blue', defaultMessage: 'Accent Blue' },
  colorGradientStart: { id: 'theme_editor.colors.gradient_start', defaultMessage: 'Gradient Start' },
  colorGradientEnd: { id: 'theme_editor.colors.gradient_end', defaultMessage: 'Gradient End' },
});

interface IThemeEditor {
}

/** UI for editing Tailwind theme colors. */
const ThemeEditor: React.FC<IThemeEditor> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const plFe = usePlFeConfig();
  const host = useAppSelector(state => getHost(state));
  const rawConfig = useAppSelector(state => state.plfe);

  const [colors, setColors] = useState(plFe.colors.toJS() as any);
  const [submitting, setSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(crypto.randomUUID());

  const fileInput = useRef<HTMLInputElement>(null);

  const updateColors = (key: string) => (newColors: ColorGroup) => {
    setColors({
      ...colors,
      [key]: {
        ...colors[key],
        ...newColors,
      },
    });
  };

  const updateColor = (key: string) => (hex: string) => {
    setColors({
      ...colors,
      [key]: hex,
    });
  };

  const setTheme = (theme: any) => {
    setResetKey(crypto.randomUUID());
    setTimeout(() => setColors(theme));
  };

  const resetTheme = () => {
    setTheme(plFe.colors.toJS() as any);
  };

  const updateTheme = async () => {
    const params = rawConfig.set('colors', colors).toJS();
    await dispatch(updatePlFeConfig(params));
  };

  const restoreDefaultTheme = () => {
    const colors = normalizePlFeConfig({ brandColor: '#d80482' }).colors.toJS();
    setTheme(colors);
  };

  const exportTheme = () => {
    const data = JSON.stringify(colors, null, 2);
    download(data, 'theme.json');
  };

  const importTheme = () => {
    fileInput.current?.click();
  };

  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.item(0);

    if (file) {
      const text = await file.text();
      const json = JSON.parse(text);
      const colors = normalizePlFeConfig({ colors: json }).colors.toJS();

      setTheme(colors);
      toast.success(intl.formatMessage(messages.importSuccess));
    }
  };

  const handleSubmit = async() => {
    setSubmitting(true);

    try {
      await dispatch(fetchPlFeConfig(host));
      await updateTheme();
      toast.success(intl.formatMessage(messages.saved));
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <List>
          <PaletteListItem
            label={intl.formatMessage(messages.colorPrimary)}
            palette={colors.primary}
            onChange={updateColors('primary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSecondary)}
            palette={colors.secondary}
            onChange={updateColors('secondary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorAccent)}
            palette={colors.accent}
            onChange={updateColors('accent')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorGray)}
            palette={colors.gray}
            onChange={updateColors('gray')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSuccess)}
            palette={colors.success}
            onChange={updateColors('success')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorDanger)}
            palette={colors.danger}
            onChange={updateColors('danger')}
            resetKey={resetKey}
          />
        </List>

        <List>
          <ColorListItem
            label={intl.formatMessage(messages.colorGreentext)}
            value={colors.greentext}
            onChange={updateColor('greentext')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorAccentBlue)}
            value={colors['accent-blue']}
            onChange={updateColor('accent-blue')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientStart)}
            value={colors['gradient-start']}
            onChange={updateColor('gradient-start')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientEnd)}
            value={colors['gradient-end']}
            onChange={updateColor('gradient-end')}
          />
        </List>

        <FormActions>
          <DropdownMenu
            items={[{
              text: intl.formatMessage(messages.restore),
              action: restoreDefaultTheme,
              icon: require('@tabler/icons/outline/refresh.svg'),
            }, {
              text: intl.formatMessage(messages.import),
              action: importTheme,
              icon: require('@tabler/icons/outline/upload.svg'),
            }, {
              text: intl.formatMessage(messages.export),
              action: exportTheme,
              icon: require('@tabler/icons/outline/download.svg'),
            }]}
          />
          <Button theme='secondary' onClick={resetTheme}>
            <FormattedMessage id='theme_editor.reset' defaultMessage='Reset' />
          </Button>

          <Button type='submit' theme='primary' disabled={submitting}>
            <FormattedMessage id='theme_editor.save' defaultMessage='Save theme' />
          </Button>
        </FormActions>
      </Form>

      <input
        type='file'
        ref={fileInput}
        multiple
        accept='application/json'
        className='hidden'
        onChange={handleSelectFile}
      />
    </Column>
  );
};

interface IPaletteListItem {
  label: React.ReactNode;
  palette: ColorGroup;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({ label, palette, onChange, resetKey }) => (
  <ListItem label={<div className='w-20'>{label}</div>}>
    <Palette palette={palette} onChange={onChange} resetKey={resetKey} />
  </ListItem>
);

interface IColorListItem {
  label: React.ReactNode;
  value: string;
  onChange: (hex: string) => void;
}

/** Single-color picker. */
const ColorListItem: React.FC<IColorListItem> = ({ label, value, onChange }) => {
  const handleChange: ColorChangeHandler = (color, _e) => {
    onChange(color.hex);
  };

  return (
    <ListItem label={label}>
      <ColorPicker
        value={value}
        onChange={handleChange}
        className='h-8 w-10 overflow-hidden rounded-md'
      />
    </ListItem>
  );
};

export { ThemeEditor as default };
