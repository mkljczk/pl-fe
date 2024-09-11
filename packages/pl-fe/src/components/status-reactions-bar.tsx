import clsx from 'clsx';
import { EmojiReaction } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { emojiReact, unEmojiReact } from 'pl-fe/actions/emoji-reacts';
import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import unicodeMapping from 'pl-fe/features/emoji/mapping';
import { useAppDispatch, useLoggedIn, useSettings } from 'pl-fe/hooks';

import AnimatedNumber from './animated-number';
import { Emoji, HStack, Icon, Text } from './ui';

import type { Emoji as EmojiType } from 'pl-fe/features/emoji';
import type { SelectedStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  emojiCount: { id: 'status.reactions.label', defaultMessage: '{count} {count, plural, one {person} other {people}} reacted with {emoji}' },
  addEmoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IStatusReactionsBar {
  status: Pick<SelectedStatus, 'id' | 'emoji_reactions'>;
  collapsed?: boolean;
}

interface IStatusReaction {
  status: Pick<SelectedStatus, 'id'>;
  reaction: EmojiReaction;
  obfuscate?: boolean;
  disabled?: boolean;
}

const StatusReaction: React.FC<IStatusReaction> = ({ reaction, status, obfuscate, disabled }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  if (!reaction.count) return null;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (disabled) return;

    if (reaction.me) {
      dispatch(unEmojiReact(status, reaction.name));
    } else {
      dispatch(emojiReact(status, reaction.name, reaction.url));
    }
  };

  let shortCode = reaction.name;

  // @ts-ignore
  if (unicodeMapping[shortCode]?.shortcode) {
    // @ts-ignore
    shortCode = unicodeMapping[shortCode].shortcode;
  }

  return (
    <button
      className={clsx('group flex cursor-pointer items-center gap-2 overflow-hidden rounded-md border border-gray-400 p-1.5 transition-colors', {
        'bg-primary-100 dark:border-primary-400 dark:bg-primary-400 black:border-primary-600 black:bg-primary-600': reaction.me,
        'bg-transparent dark:border-primary-700 dark:bg-primary-700 black:border-primary-800 black:bg-primary-800': !reaction.me,
        'cursor-pointer': !disabled,
        'hover:bg-primary-200 hover:dark:border-primary-300 hover:dark:bg-primary-300 hover:black:bg-primary-500': reaction.me && !disabled,
        'hover:bg-primary-100 hover:dark:border-primary-600 hover:dark:bg-primary-600 hover:black:bg-primary-700': !reaction.me && !disabled,
      })}
      key={reaction.name}
      onClick={handleClick}
      title={intl.formatMessage(messages.emojiCount, {
        emoji: `:${shortCode}:`,
        count: reaction.count,
      })}
      disabled={disabled}
    >
      <Emoji className='h-4 w-4' emoji={reaction.name} src={reaction.url || undefined} />

      <Text size='xs' weight='semibold' theme='inherit'>
        <AnimatedNumber value={reaction.count} obfuscate={obfuscate} short />
      </Text>
    </button>
  );
};

const StatusReactionsBar: React.FC<IStatusReactionsBar> = ({ status, collapsed }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { me } = useLoggedIn();
  const { demetricator } = useSettings();

  const handlePickEmoji = (emoji: EmojiType) => {
    dispatch(emojiReact(status, emoji.custom ? emoji.id : emoji.native, emoji.custom ? emoji.imageUrl : undefined));
  };

  if ((demetricator || status.emoji_reactions.length === 0) && collapsed) return null;

  const sortedReactions = status.emoji_reactions.toSorted((a, b) => (b.count || 0) - (a.count || 0));

  return (
    <HStack className='pt-2' space={2} wrap>
      {sortedReactions.map((reaction) => reaction.count ? (
        <StatusReaction key={reaction.name} status={status} reaction={reaction} obfuscate={demetricator} />
      ) : null)}
      {me && (
        <EmojiPickerDropdown onPickEmoji={handlePickEmoji}>
          <button
            className='emoji-picker-dropdown cursor-pointer rounded-md border border-gray-400 bg-transparent p-1.5 transition-colors hover:bg-gray-50 black:border-primary-800 black:bg-primary-800 hover:black:bg-primary-700 dark:border-primary-700 dark:bg-primary-700 hover:dark:border-primary-600 hover:dark:bg-primary-600'
            title={intl.formatMessage(messages.addEmoji)}
          >
            <Icon
              className='h-4 w-4'
              src={require('@tabler/icons/outline/mood-plus.svg')}
            />
          </button>
        </EmojiPickerDropdown>
      )}
    </HStack>
  );
};

export { StatusReactionsBar as default };
