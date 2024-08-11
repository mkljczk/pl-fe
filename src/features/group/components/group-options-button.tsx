import { GroupRoles, type Group } from 'pl-api';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { useLeaveGroup } from 'soapbox/api/hooks';
import DropdownMenu, { Menu } from 'soapbox/components/dropdown-menu';
import { IconButton } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  leave: { id: 'group.leave.label', defaultMessage: 'Leave' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
  share: { id: 'group.share.label', defaultMessage: 'Share' },
});

interface IGroupActionButton {
  group: Pick<Group, 'id' | 'display_name' | 'url' | 'relationship'>;
}

const GroupOptionsButton = ({ group }: IGroupActionButton) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const leaveGroup = useLeaveGroup(group);

  const isMember = group.relationship?.role === GroupRoles.USER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;
  const isInGroup = !!group.relationship?.member;

  const handleShare = () => {
    navigator.share({
      text: group.display_name,
      url: group.url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const handleLeave = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => leaveGroup.mutate(group.relationship?.id as string, {
        onSuccess() {
          leaveGroup.invalidate();
          toast.success(intl.formatMessage(messages.leaveSuccess));
        },
      }),
    }));

  const menu: Menu = useMemo(() => {
    const canShare = 'share' in navigator;
    const items = [];

    if (canShare) {
      items.push({
        text: intl.formatMessage(messages.share),
        icon: require('@tabler/icons/outline/share.svg'),
        action: handleShare,
      });
    }

    if (isAdmin) {
      items.push(null);
      items.push({
        text: intl.formatMessage(messages.leave),
        icon: require('@tabler/icons/outline/logout.svg'),
        action: handleLeave,
      });
    }

    return items;
  }, [isMember, isAdmin, isInGroup]);

  if (menu.length === 0) {
    return null;
  }

  return (
    <DropdownMenu items={menu} placement='bottom'>
      <IconButton
        src={require('@tabler/icons/outline/dots.svg')}
        theme='secondary'
        iconClassName='h-5 w-5'
        className='self-stretch px-2.5'
        data-testid='dropdown-menu-button'
      />
    </DropdownMenu>
  );
};

export { GroupOptionsButton as default };