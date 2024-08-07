import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { useCreateGroup } from 'soapbox/api/hooks';
import { Modal, Stack } from 'soapbox/components/ui';
import { type Group } from 'soapbox/schemas';
import toast from 'soapbox/toast';

import ConfirmationStep from './steps/confirmation-step';
import DetailsStep from './steps/details-step';

import type { CreateGroupParams } from 'pl-api';
import type { PlfeResponse } from 'soapbox/api';

const messages = defineMessages({
  next: { id: 'manage_group.next', defaultMessage: 'Next' },
  create: { id: 'manage_group.create', defaultMessage: 'Create Group' },
  done: { id: 'manage_group.done', defaultMessage: 'Done' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
}

interface ICreateGroupModal {
  onClose: (type?: string) => void;
}

const CreateGroupModal: React.FC<ICreateGroupModal> = ({ onClose }) => {
  const intl = useIntl();

  const [group, setGroup] = useState<Group | null>(null);
  const [params, setParams] = useState<CreateGroupParams>({
    display_name: '',
  });
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const { createGroup, isSubmitting } = useCreateGroup();

  const handleClose = () => {
    onClose('MANAGE_GROUP');
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.TWO:
        return intl.formatMessage(messages.done);
      default:
        return intl.formatMessage(messages.create);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        createGroup(params, {
          onSuccess(group) {
            setCurrentStep(Steps.TWO);
            setGroup(group);
          },
          onError(error: { response?: PlfeResponse }) {
            const msg = z.object({ error: z.string() }).safeParse(error?.response?.json);
            if (msg.success) {
              toast.error(msg.data.error);
            }
          },
        });
        break;
      case Steps.TWO:
        handleClose();
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        return <DetailsStep params={params} onChange={setParams} />;
      case Steps.TWO:
        return <ConfirmationStep group={group} />;
    }
  };

  const renderModalTitle = () => <FormattedMessage id='navigation_bar.create_group' defaultMessage='Create group' />;

  return (
    <Modal
      title={renderModalTitle()}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isSubmitting}
      confirmationFullWidth
      onClose={handleClose}
    >
      <Stack space={2}>
        {renderStep()}
      </Stack>
    </Modal>
  );
};

export { CreateGroupModal as default };
