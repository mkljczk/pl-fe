import { useStatus } from 'pl-hooks';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Link from 'pl-fe/components/link';
import Text from 'pl-fe/components/ui/text';
import { useCompose } from 'pl-fe/hooks/useCompose';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator = (props: IReplyGroupIndicator) => {
  const { composeId } = props;

  const inReplyTo = useCompose(composeId).in_reply_to!;

  const { data: status } = useStatus(inReplyTo);
  const group = status?.group;

  if (!group) {
    return null;
  }

  return (
    <Text theme='muted' size='sm'>
      <FormattedMessage
        id='compose.reply_group_indicator.message'
        defaultMessage='Posting to {groupLink}'
        values={{
          groupLink: <Link
            to={`/groups/${group.id}`}
            dangerouslySetInnerHTML={{ __html: group.display_name_html }}
          />,
        }}
      />
    </Text>
  );
};

export { ReplyGroupIndicator as default };
