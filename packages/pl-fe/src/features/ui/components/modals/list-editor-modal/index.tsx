import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setupListEditor, resetListEditor } from 'pl-fe/actions/lists';
import { CardHeader, CardTitle, Modal } from 'pl-fe/components/ui';
import { useAppSelector, useAppDispatch } from 'pl-fe/hooks';

import Account from './components/account';
import EditListForm from './components/edit-list-form';
import Search from './components/search';

import type { BaseModalProps } from '../../modal-root';

const messages = defineMessages({
  changeTitle: { id: 'lists.edit.submit', defaultMessage: 'Change title' },
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
});

interface ListEditorModalProps {
  listId: string;
}

const ListEditorModal: React.FC<BaseModalProps & ListEditorModalProps> = ({ listId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.listEditor.accounts.items);
  const searchAccountIds = useAppSelector((state) => state.listEditor.suggestions.items);

  useEffect(() => {
    dispatch(setupListEditor(listId));

    return () => {
      dispatch(resetListEditor());
    };
  }, []);

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={<FormattedMessage id='lists.edit' defaultMessage='Edit list' />}
      onClose={onClickClose}
    >
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.changeTitle)} />
      </CardHeader>
      <EditListForm />
      <br />

      {accountIds.size > 0 && (
        <div>
          <CardHeader>
            <CardTitle title={intl.formatMessage(messages.removeFromList)} />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {accountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
          </div>
        </div>
      )}

      <br />
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.addToList)} />
      </CardHeader>
      <Search />
      <div className='max-h-48 overflow-y-auto'>
        {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
      </div>
    </Modal>
  );
};

export { ListEditorModal as default, type ListEditorModalProps };
