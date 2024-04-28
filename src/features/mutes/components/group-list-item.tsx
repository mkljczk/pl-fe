import React from 'react';

import GroupAvatar from 'soapbox/components/groups/group-avatar';
import { HStack, Text } from 'soapbox/components/ui';
import { type Group } from 'soapbox/schemas';

interface IGroupListItem {
  group: Group;
  onUnmute(): void;
}

const GroupListItem = ({ group, onUnmute }: IGroupListItem) => (
  <HStack alignItems='center' space={3}>
    <GroupAvatar
      group={group}
      size={42}
    />

    <Text
      weight='semibold'
      size='sm'
      dangerouslySetInnerHTML={{ __html: group.display_name_html }}
      truncate
    />
  </HStack>
);

export default GroupListItem;