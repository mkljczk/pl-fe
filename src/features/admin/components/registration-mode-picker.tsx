import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { updateConfig } from 'soapbox/actions/admin';
import { RadioGroup, RadioItem } from 'soapbox/components/radio';
import { useAppDispatch, useInstance } from 'soapbox/hooks';
import { Instance } from 'soapbox/schemas';
import toast from 'soapbox/toast';

type RegistrationMode = 'open' | 'approval' | 'closed';

const messages = defineMessages({
  saved: { id: 'admin.dashboard.settings_saved', defaultMessage: 'Settings saved!' },
});

const generateConfig = (mode: RegistrationMode) => {
  const configMap = {
    open: [{ tuple: [':registrations_open', true] }, { tuple: [':account_approval_required', false] }],
    approval: [{ tuple: [':registrations_open', true] }, { tuple: [':account_approval_required', true] }],
    closed: [{ tuple: [':registrations_open', false] }],
  };

  return [{
    group: ':pleroma',
    key: ':instance',
    value: configMap[mode],
  }];
};

const modeFromInstance = ({ registrations }: Instance): RegistrationMode => {
  if (registrations.approval_required && registrations.enabled) return 'approval';
  return registrations.enabled ? 'open' : 'closed';
};

/** Allows changing the registration mode of the instance, eg "open", "closed", "approval" */
const RegistrationModePicker: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const mode = modeFromInstance(instance);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const config = generateConfig(e.target.value as RegistrationMode);
    dispatch(updateConfig(config)).then(() => {
      toast.success(intl.formatMessage(messages.saved));
    }).catch(() => {});
  };

  return (
    <RadioGroup onChange={onChange}>
      <RadioItem
        label={<FormattedMessage id='admin.dashboard.registration_mode.open_label' defaultMessage='Open' />}
        hint={<FormattedMessage id='admin.dashboard.registration_mode.open_hint' defaultMessage='Anyone can join.' />}
        checked={mode === 'open'}
        value='open'
      />
      <RadioItem
        label={<FormattedMessage id='admin.dashboard.registration_mode.approval_label' defaultMessage='Approval Required' />}
        hint={<FormattedMessage id='admin.dashboard.registration_mode.approval_hint' defaultMessage='Users can sign up, but their account only gets activated when an admin approves it.' />}
        checked={mode === 'approval'}
        value='approval'
      />
      <RadioItem
        label={<FormattedMessage id='admin.dashboard.registration_mode.closed_label' defaultMessage='Closed' />}
        hint={<FormattedMessage id='admin.dashboard.registration_mode.closed_hint' defaultMessage='Nobody can sign up. You can still invite people.' />}
        checked={mode === 'closed'}
        value='closed'
      />
    </RadioGroup>
  );
};

export { RegistrationModePicker as default };
