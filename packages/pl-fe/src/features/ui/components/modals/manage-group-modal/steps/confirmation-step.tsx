import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { ParsedContent } from 'pl-fe/components/parsed-content';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import Divider from 'pl-fe/components/ui/divider';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import toast from 'pl-fe/toast';
import copy from 'pl-fe/utils/copy';

import type { Group } from 'pl-fe/normalizers';

interface IConfirmationStep {
  group: Group | null;
}

const messages = defineMessages({
  copied: { id: 'copy.success', defaultMessage: 'Copied to clipboard!' },
});

const ConfirmationStep: React.FC<IConfirmationStep> = ({ group }) => {
  const intl = useIntl();

  const handleCopyLink = () => {
    copy(group?.url as string, () => {
      toast.success(intl.formatMessage(messages.copied));
    });
  };

  const handleShare = () => {
    navigator.share({
      text: group?.display_name,
      url: group?.uri,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  if (!group) {
    return null;
  }

  return (
    <Stack space={9}>
      <Stack space={3}>
        <Stack>
          <label
            className='dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow'
          >
            {group.header && <img className='size-full object-cover' src={group.header} alt={group.header_description} />}
          </label>

          <label className='mx-auto -mt-10 cursor-pointer rounded-full bg-primary-500 ring-2 ring-white dark:ring-primary-900'>
            {group.avatar && <Avatar src={group.avatar} alt={group.avatar_description} size={80} />}
          </label>
        </Stack>

        <Stack>
          <Text size='2xl' weight='bold' align='center'>{group.display_name}</Text>
          <Text
            size='md'
            className='mx-auto max-w-sm [&_a]:text-primary-600 [&_a]:hover:underline [&_a]:dark:text-accent-blue'
          >
            <ParsedContent html={group.note_emojified} />
          </Text>
        </Stack>
      </Stack>

      <Divider />

      <Stack space={4}>
        <Text size='3xl' weight='bold' align='center'>
          <FormattedMessage id='manage_group.confirmation.title' defaultMessage='You’re all set!' />
        </Text>

        <Stack space={5}>
          <InfoListItem number={1}>
            <Text theme='muted'>
              <FormattedMessage
                id='manage_group.confirmation.info_1'
                defaultMessage='As the owner of this group, you can assign staff, delete posts and much more.'
              />
            </Text>
          </InfoListItem>

          <InfoListItem number={2}>
            <Text theme='muted'>
              <FormattedMessage
                id='manage_group.confirmation.info_2'
                defaultMessage="Post the group's first post and get the conversation started."
              />
            </Text>
          </InfoListItem>

          <InfoListItem number={3}>
            <Text theme='muted'>
              <FormattedMessage
                id='manage_group.confirmation.info_3'
                defaultMessage='Share your new group with friends, family and followers to grow its membership.'
              />
            </Text>
          </InfoListItem>
        </Stack>
      </Stack>

      <HStack space={2} justifyContent='center'>
        {('share' in navigator) && (
          <Button onClick={handleShare} theme='transparent' icon={require('@tabler/icons/outline/share.svg')} className='text-primary-600'>
            <FormattedMessage id='manage_group.confirmation.share' defaultMessage='Share this group' />
          </Button>
        )}

        <Button onClick={handleCopyLink} theme='transparent' icon={require('@tabler/icons/outline/link.svg')} className='text-primary-600'>
          <FormattedMessage id='manage_group.confirmation.copy' defaultMessage='Copy link' />
        </Button>
      </HStack>
    </Stack>
  );
};

interface IInfoListNumber {
  number: number;
}

const InfoListNumber: React.FC<IInfoListNumber> = ({ number }) => (
  <div className='flex size-7 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800'>
    <Text theme='primary' size='sm' weight='bold'>{number}</Text>
  </div>
);

interface IInfoListItem {
  number: number;
  children: React.ReactNode;
}

const InfoListItem: React.FC<IInfoListItem> = ({ number, children }) => (
  <HStack alignItems='top' space={3}>
    <InfoListNumber number={number} />
    <div className='mt-0.5'>
      {children}
    </div>
  </HStack>
);

export { ConfirmationStep as default };
