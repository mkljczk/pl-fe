import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Notification as BaseNotification,
  Poll as BasePoll,
  Status as BaseStatus,
} from 'pl-api';

const importEntities = (entities: {
  accounts?: Array<BaseAccount>;
  notifications?: Array<BaseNotification>;
  statuses?: Array<BaseStatus>;
}) => {
  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const notifications: Record<string, BaseNotification> = {};
  const polls: Record<string, BasePoll> = {};
  const statuses: Record<string, BaseStatus> = {};

  const processAccount = (account: BaseAccount) => {
    accounts[account.id] = account;
    if (account.moved) processAccount(account.moved);
  };

  const processNotification = (notification: BaseNotification) => {
    notifications[notification.id] = notification;

    processAccount(notification.account);
    if (notification.type === 'move') processAccount(notification.target);

    if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'].includes(notification.type))
      // @ts-ignore
      processStatus(notification.status);
  };

  const processStatus = (status: BaseStatus) => {
    statuses[status.id] = status;

    if (status.quote) processStatus(status.quote);
    if (status.reblog) processStatus(status.reblog);
  };

  entities.accounts?.forEach(processAccount);
  entities.notifications?.forEach(processNotification);
  entities.statuses?.forEach(processStatus);
};

export { importEntities };
