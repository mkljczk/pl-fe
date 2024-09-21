import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeStatusLanguage } from 'pl-fe/actions/statuses';
import { type Language, languages } from 'pl-fe/features/preferences';
import { useAppDispatch } from 'pl-fe/hooks';

import DropdownMenu from './dropdown-menu';
import { HStack, Icon, Text } from './ui';

import type { Status } from 'pl-fe/normalizers';

const messages = defineMessages({
  languageVersions: { id: 'status.language_versions', defaultMessage: 'The post has multiple language versions.' },
});

interface IStatusLanguagePicker {
  status: Pick<Status, 'id' | 'contentMapHtml' | 'currentLanguage'>;
  showLabel?: boolean;
}

const StatusLanguagePicker: React.FC<IStatusLanguagePicker> = ({ status, showLabel }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  if (!status.contentMapHtml || Object.keys(status.contentMapHtml).length < 2) return null;

  const icon = <Icon className='size-4 text-gray-700 dark:text-gray-600' src={require('@tabler/icons/outline/language.svg')} />;

  return (
    <>
      <Text tag='span' theme='muted' size='sm'>&middot;</Text>

      <DropdownMenu
        items={Object.keys(status.contentMapHtml).map((language) => ({
          text: languages[language as Language] || language,
          action: () => dispatch(changeStatusLanguage(status.id, language)),
          active: language === status.currentLanguage,
        }))}
      >
        <button title={intl.formatMessage(messages.languageVersions)} className='hover:underline'>
          {showLabel ? (
            <HStack space={1} alignItems='center'>
              {icon}
              <Text tag='span' theme='muted' size='sm'>
                {languages[status.currentLanguage as Language] || status.currentLanguage}
              </Text>
            </HStack>
          ) : icon}
        </button>
      </DropdownMenu>
    </>
  );
};

export {
  StatusLanguagePicker as default,
};
