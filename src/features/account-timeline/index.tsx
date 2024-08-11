import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchAccountByUsername } from 'soapbox/actions/accounts';
import { fetchAccountTimeline } from 'soapbox/actions/timelines';
import { useAccountLookup } from 'soapbox/api/hooks';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusList from 'soapbox/components/status-list';
import { Card, CardBody, Spinner, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures, useSettings } from 'soapbox/hooks';
import { makeGetStatusIds } from 'soapbox/selectors';

const getStatusIds = makeGetStatusIds();

interface IAccountTimeline {
  params: {
    username: string;
  };
  withReplies?: boolean;
}

const AccountTimeline: React.FC<IAccountTimeline> = ({ params, withReplies = false }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const settings = useSettings();

  const { account } = useAccountLookup(params.username, { withRelationship: true });
  const [accountLoading, setAccountLoading] = useState<boolean>(!account);

  const path = withReplies ? `${account?.id}:with_replies` : account?.id;
  const showPins = settings.account_timeline.shows.pinned && !withReplies;
  const statusIds = useAppSelector(state => getStatusIds(state, { type: `account:${path}`, prefix: 'account_timeline' }));
  const featuredStatusIds = useAppSelector(state => getStatusIds(state, { type: `account:${account?.id}:pinned`, prefix: 'account_timeline' }));

  const isBlocked = useAppSelector(state => state.relationships.getIn([account?.id, 'blocked_by']) === true);
  const unavailable = isBlocked && !features.blockersVisible;
  const isLoading = useAppSelector(state => state.getIn(['timelines', `account:${path}`, 'isLoading']) === true);
  const hasMore = useAppSelector(state => state.getIn(['timelines', `account:${path}`, 'hasMore']) === true);

  const accountUsername = account?.username || params.username;

  useEffect(() => {
    dispatch(fetchAccountByUsername(params.username, history))
      .then(() => setAccountLoading(false))
      .catch(() => setAccountLoading(false));
  }, [params.username]);

  useEffect(() => {
    if (account && !withReplies) {
      dispatch(fetchAccountTimeline(account.id, { pinned: true }));
    }
  }, [account?.id, withReplies]);

  useEffect(() => {
    if (account) {
      dispatch(fetchAccountTimeline(account.id, { exclude_replies: !withReplies }));
    }
  }, [account?.id, withReplies]);

  const handleLoadMore = (maxId: string) => {
    if (account) {
      dispatch(fetchAccountTimeline(account.id, { exclude_replies: !withReplies }, true));
    }
  };

  if (!account && accountLoading) {
    return <Spinner />;
  } else if (!account) {
    return <MissingIndicator nested />;
  }

  if (unavailable) {
    return (
      <Card>
        <CardBody>
          <Text align='center'>
            {isBlocked ? (
              <FormattedMessage id='empty_column.account_blocked' defaultMessage='You are blocked by @{accountUsername}.' values={{ accountUsername }} />
            ) : (
              <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
            )}
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <StatusList
      scrollKey='account_timeline'
      statusIds={statusIds}
      featuredStatusIds={showPins ? featuredStatusIds : undefined}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      emptyMessage={<FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />}
    />
  );
};

export { AccountTimeline as default };
