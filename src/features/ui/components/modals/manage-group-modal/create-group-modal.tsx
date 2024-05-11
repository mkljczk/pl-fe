import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { useCreateGroup, type CreateGroupParams } from 'soapbox/api/hooks';
import { Modal, Stack } from 'soapbox/components/ui';
import { type Group } from 'soapbox/schemas';
import toast from 'soapbox/toast';

import ConfirmationStep from './steps/confirmation-step';
import DetailsStep from './steps/details-step';
import PrivacyStep from './steps/privacy-step';

const messages = defineMessages({
  next: { id: 'manage_group.next', defaultMessage: 'Next' },
  create: { id: 'manage_group.create', defaultMessage: 'Create Group' },
  done: { id: 'manage_group.done', defaultMessage: 'Done' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

interface ICreateGroupModal {
  onClose: (type?: string) => void;
}

const CreateGroupModal: React.FC<ICreateGroupModal> = ({ onClose }) => {
  const intl = useIntl();

  const [group, setGroup] = useState<Group | null>(null);
  const [params, setParams] = useState<CreateGroupParams>({
    group_visibility: 'everyone',
  });
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const { createGroup, isSubmitting } = useCreateGroup();

  const handleClose = () => {
    onClose('MANAGE_GROUP');
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.THREE:
        return intl.formatMessage(messages.done);
      case Steps.TWO:
        return intl.formatMessage(messages.create);
      default:
        return intl.formatMessage(messages.next);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        setCurrentStep(Steps.TWO);
        break;
      case Steps.TWO:
        createGroup(params, {
          onSuccess(group) {
            setCurrentStep(Steps.THREE);
            setGroup(group);
          },
          onError(error: { response?: Response }) {
            const msg = z.object({ error: z.string() }).safeParse(error?.response?.json);
            if (msg.success) {
              toast.error(msg.data.error);
            }
          },
        });
        break;
      case Steps.THREE:
        handleClose();
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        return <PrivacyStep params={params} onChange={setParams} />;
      case Steps.TWO:
        return <DetailsStep params={params} onChange={setParams} />;
      case Steps.THREE:
        return <ConfirmationStep group={group} />;
    }
  };

  const renderModalTitle = () => {
    switch (currentStep) {
      case Steps.ONE:
        return <FormattedMessage id='navigation_bar.create_group' defaultMessage='Create group' />;
      default:
        if (params.group_visibility === 'everyone') {
          return <FormattedMessage id='navigation_bar.create_group.public' defaultMessage='Create public group' />;
        } else {
          return <FormattedMessage id='navigation_bar.create_group.private' defaultMessage='Create private group' />;
        }
    }
  };

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

export default CreateGroupModal;
