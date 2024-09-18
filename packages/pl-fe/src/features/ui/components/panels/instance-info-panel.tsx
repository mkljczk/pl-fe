import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { pinHost, unpinHost } from 'pl-fe/actions/remote-timeline';
import { Widget } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector, useSettings } from 'pl-fe/hooks';
import { makeGetRemoteInstance } from 'pl-fe/selectors';

const getRemoteInstance = makeGetRemoteInstance();

const messages = defineMessages({
  pinHost: { id: 'remote_instance.pin_host', defaultMessage: 'Pin {host}' },
  unpinHost: {
    id: 'remote_instance.unpin_host',
    defaultMessage: 'Unpin {host}',
  },
});

interface IInstanceInfoPanel {
  /** Hostname (domain) of the remote instance, eg "gleasonator.com" */
  host: string;
}

/** Widget that displays information about a remote instance to users. */
const InstanceInfoPanel: React.FC<IInstanceInfoPanel> = ({ host }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const remoteInstance: any = useAppSelector((state) =>
    getRemoteInstance(state, host),
  );
  const pinned = settings.remote_timeline.pinnedHosts.includes(host);

  const handlePinHost = () => {
    if (!pinned) {
      dispatch(pinHost(host));
    } else {
      dispatch(unpinHost(host));
    }
  };

  if (!remoteInstance) return null;

  return (
    <Widget
      title={remoteInstance.host}
      onActionClick={handlePinHost}
      actionIcon={
        pinned
          ? require('@tabler/icons/outline/pinned-off.svg')
          : require('@tabler/icons/outline/pin.svg')
      }
      actionTitle={intl.formatMessage(
        pinned ? messages.unpinHost : messages.pinHost,
        { host },
      )}
    />
  );
};

export { InstanceInfoPanel as default };
