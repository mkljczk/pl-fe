import React from 'react';

import Widget from 'pl-fe/components/ui/widget';
import Stack from 'pl-fe/components/ui/stack';

import ProfileField from '../profile-field';

import type { Account } from 'pl-fe/normalizers';

interface IProfileFieldsPanel {
  account: Pick<Account, 'fields'>;
}

/** Custom profile fields for sidebar. */
const ProfileFieldsPanel: React.FC<IProfileFieldsPanel> = ({ account }) => (
  <Widget>
    <Stack space={4}>
      {account.fields.map((field, i) => (
        <ProfileField field={field} key={i} />
      ))}
    </Stack>
  </Widget>
);

export { ProfileFieldsPanel as default };
