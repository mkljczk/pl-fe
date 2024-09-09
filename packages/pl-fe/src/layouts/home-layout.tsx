import clsx from 'clsx';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { uploadCompose } from 'pl-fe/actions/compose';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  PromoPanel,
  CryptoDonatePanel,
  BirthdayPanel,
  AnnouncementsPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useOwnAccount, useFeatures, usePlFeConfig, useDraggedFiles, useAppDispatch } from 'pl-fe/hooks';
import { useIsMobile } from 'pl-fe/hooks/useIsMobile';

import { Avatar, Card, CardBody, HStack, Layout } from '../components/ui';
import ComposeForm from '../features/compose/components/compose-form';

interface IHomeLayout {
  children: React.ReactNode;
}

const HomeLayout: React.FC<IHomeLayout> = ({ children }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const plFeConfig = usePlFeConfig();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const hasCrypto = typeof plFeConfig.cryptoAddresses.getIn([0, 'ticker']) === 'string';
  const cryptoLimit = plFeConfig.cryptoDonatePanel.get('limit', 0);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  return (
    <>
      <Layout.Main className={clsx('black:space-y-0 dark:divide-gray-800', { 'pt-3 sm:pt-0 space-y-3': !isMobile })}>
        {me && (
          <Card
            className={clsx('relative z-[1] border-gray-200 transition black:border-b black:border-gray-800 dark:border-gray-800', {
              'border-2 border-primary-600 border-dashed z-[99]': isDragging,
              'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
              'border-b': isMobile,
            })}
            variant='rounded'
            ref={composeBlock}
          >
            <CardBody>
              <HStack alignItems='start' space={2}>
                <Link to={`/@${acct}`}>
                  <Avatar src={avatar} alt={account?.avatar_description} size={42} />
                </Link>

                <div className='w-full translate-y-0.5'>
                  <ComposeForm
                    id={composeId}
                    shouldCondense
                    autoFocus={false}
                    clickableAreaRef={composeBlock}
                    withAvatar
                    transparent
                  />
                </div>
              </HStack>
            </CardBody>
          </Card>
        )}

        {children}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {me && features.announcements && (
          <AnnouncementsPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {(hasCrypto && cryptoLimit > 0 && me) && (
          <CryptoDonatePanel limit={cryptoLimit} />
        )}
        <PromoPanel />
        {features.birthdays && (
          <BirthdayPanel limit={10} />
        )}
        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { HomeLayout as default };
