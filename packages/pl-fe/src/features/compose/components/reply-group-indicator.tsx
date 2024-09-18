import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Link from 'pl-fe/components/link';
import { Text } from 'pl-fe/components/ui';
import { useAppSelector } from 'pl-fe/hooks';
import { makeGetStatus } from 'pl-fe/selectors';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator = (props: IReplyGroupIndicator) => {
  const { composeId } = props;

  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) =>
    getStatus(state, { id: state.compose.get(composeId)?.in_reply_to! }),
  );
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
          groupLink: (
            <Link
              to={`/groups/${group.id}`}
              dangerouslySetInnerHTML={{ __html: group.display_name_html }}
            />
          ),
        }}
      />
    </Text>
  );
};

export { ReplyGroupIndicator as default };
