import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeContentType } from 'pl-fe/actions/compose';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import Button from 'pl-fe/components/ui/button';
import { useAppDispatch } from 'pl-fe/hooks/useAppDispatch';
import { useCompose } from 'pl-fe/hooks/useCompose';
import { useInstance } from 'pl-fe/hooks/useInstance';

const messages = defineMessages({
  content_type_plaintext: { id: 'preferences.options.content_type_plaintext', defaultMessage: 'Plain text' },
  content_type_markdown: { id: 'preferences.options.content_type_markdown', defaultMessage: 'Markdown' },
  content_type_html: { id: 'preferences.options.content_type_html', defaultMessage: 'HTML' },
  content_type_wysiwyg: { id: 'preferences.options.content_type_wysiwyg', defaultMessage: 'WYSIWYG' },
  change_content_type: { id: 'compose_form.content_type.change', defaultMessage: 'Change content type' },
});

interface IContentTypeButton {
  composeId: string;
}

const ContentTypeButton: React.FC<IContentTypeButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const contentType = useCompose(composeId).content_type;

  const handleChange = (contentType: string) => () => dispatch(changeComposeContentType(composeId, contentType));

  const options = [
    {
      icon: require('@tabler/icons/outline/pilcrow.svg'),
      text: intl.formatMessage(messages.content_type_plaintext),
      value: 'text/plain',
    },
    { icon: require('@tabler/icons/outline/markdown.svg'),
      text: intl.formatMessage(messages.content_type_markdown),
      value: 'text/markdown',
    },
  ];

  if (instance.pleroma.metadata.post_formats?.includes('text/html')) {
    options.push({
      icon: require('@tabler/icons/outline/html.svg'),
      text: intl.formatMessage(messages.content_type_html),
      value: 'text/html',
    });
  }

  options.push({
    icon: require('@tabler/icons/outline/text-caption.svg'),
    text: intl.formatMessage(messages.content_type_wysiwyg),
    value: 'wysiwyg',
  });

  const option = options.find(({ value }) => value === contentType);

  return (
    <DropdownMenu
      items={options.map(({ icon, text, value }) => ({
        icon,
        text,
        action: handleChange(value),
        active: contentType === value,
      }))}
    >
      <Button
        theme='muted'
        size='xs'
        text={option?.text}
        icon={option?.icon}
        secondaryIcon={require('@tabler/icons/outline/chevron-down.svg')}
        title={intl.formatMessage(messages.change_content_type)}
      />
    </DropdownMenu>
  );

};

export { ContentTypeButton as default };
