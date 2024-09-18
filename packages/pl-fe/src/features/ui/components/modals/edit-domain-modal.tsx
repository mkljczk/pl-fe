import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useDomains } from 'pl-fe/api/hooks/admin';
import {
  Form,
  FormGroup,
  HStack,
  Input,
  Modal,
  Stack,
  Text,
  Toggle,
} from 'pl-fe/components/ui';
import toast from 'pl-fe/toast';

import type { AdminDomain } from 'pl-api';
import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  save: { id: 'admin.edit_domain.save', defaultMessage: 'Save' },
  domainPlaceholder: {
    id: 'admin.edit_domain.fields.domain_placeholder',
    defaultMessage: 'Domain name',
  },
  domainCreateSuccess: {
    id: 'admin.edit_domain.created',
    defaultMessage: 'Domain created',
  },
  domainUpdateSuccess: {
    id: 'admin.edit_domain.updated',
    defaultMessage: 'Domain edited',
  },
});

interface EditDomainModalProps {
  domainId?: string;
}

const EditDomainModal: React.FC<BaseModalProps & EditDomainModalProps> = ({
  onClose,
  domainId,
}) => {
  const intl = useIntl();

  const {
    data: domains,
    createDomain,
    isCreating,
    updateDomain,
    isUpdating,
  } = useDomains();

  const [domain] = useState<AdminDomain | null>(
    domainId ? domains!.find(({ id }) => domainId === id)! : null,
  );
  const [domainName, setDomainName] = useState(domain?.domain || '');
  const [isPublic, setPublic] = useState(domain?.public || false);

  const onClickClose = () => {
    onClose('EDIT_DOMAIN');
  };

  const handleSubmit = () => {
    if (domainId) {
      updateDomain(
        {
          id: domainId,
          public: isPublic,
        },
        {
          onSuccess: () => {
            toast.success(messages.domainUpdateSuccess);
            onClose('EDIT_DOMAIN');
          },
        },
      );
    } else {
      createDomain(
        {
          domain: domainName,
          public: isPublic,
        },
        {
          onSuccess: () => {
            toast.success(messages.domainCreateSuccess);
            onClose('EDIT_DOMAIN');
          },
        },
      );
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={
        domainId ? (
          <FormattedMessage
            id='column.admin.edit_domain'
            defaultMessage='Edit domain'
          />
        ) : (
          <FormattedMessage
            id='column.admin.create_domain'
            defaultMessage='Create domain'
          />
        )
      }
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
      confirmationDisabled={isCreating || isUpdating}
    >
      <Form>
        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.edit_domain.fields.domain_label'
              defaultMessage='Domain'
            />
          }
        >
          <Input
            autoComplete='off'
            placeholder={intl.formatMessage(messages.domainPlaceholder)}
            value={domainName}
            onChange={({ target }) => setDomainName(target.value)}
            disabled={!!domainId}
          />
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={isPublic}
            onChange={({ target }) => setPublic(target.checked)}
          />
          <Stack>
            <Text tag='span' theme='muted'>
              <FormattedMessage
                id='admin.edit_domain.fields.public_label'
                defaultMessage='Public'
              />
            </Text>
            <Text size='xs' tag='span' theme='muted'>
              <FormattedMessage
                id='admin.edit_domain.fields.public_hint'
                defaultMessage='When checked, everyone can sign up for an username with this domain'
              />
            </Text>
          </Stack>
        </HStack>
      </Form>
    </Modal>
  );
};

export { EditDomainModal as default, type EditDomainModalProps };
