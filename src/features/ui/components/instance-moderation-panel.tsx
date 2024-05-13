import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import DropdownMenu from 'soapbox/components/dropdown-menu';
import { Widget } from 'soapbox/components/ui';
import InstanceRestrictions from 'soapbox/features/federation-restrictions/components/instance-restrictions';
import { useAppSelector, useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { makeGetRemoteInstance } from 'soapbox/selectors';

const getRemoteInstance = makeGetRemoteInstance();

const messages = defineMessages({
  editFederation: { id: 'remote_instance.edit_federation', defaultMessage: 'Edit federation' },
});

interface IInstanceModerationPanel {
  /** Host (eg "gleasonator.com") of the remote instance to moderate. */
  host: string;
}

/** Widget for moderators to manage a remote instance. */
const InstanceModerationPanel: React.FC<IInstanceModerationPanel> = ({ host }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host));

  const handleEditFederation = () => {
    dispatch(openModal('EDIT_FEDERATION', { host }));
  };

  const makeMenu = () => [{
    text: intl.formatMessage(messages.editFederation),
    action: handleEditFederation,
    icon: require('@tabler/icons/outline/edit.svg'),
  }];

  const menu = makeMenu();

  return (
    <Widget
      title={<FormattedMessage id='remote_instance.federation_panel.heading' defaultMessage='Federation Restrictions' />}
      action={account?.admin ? (
        <DropdownMenu items={menu} src={require('@tabler/icons/outline/dots-vertical.svg')} />
      ) : undefined}
    >
      <InstanceRestrictions remoteInstance={remoteInstance} />
    </Widget>
  );
};

export { InstanceModerationPanel as default };
