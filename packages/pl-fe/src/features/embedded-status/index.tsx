import { useStatus } from 'pl-hooks/hooks/statuses/useStatus';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import MissingIndicator from 'pl-fe/components/missing-indicator';
import SiteLogo from 'pl-fe/components/site-logo';
import Status from 'pl-fe/components/status';
import { Spinner } from 'pl-fe/components/ui';
import { useLogo } from 'pl-fe/hooks';
import { iframeId } from 'pl-fe/iframe';

interface IEmbeddedStatus {
  params: {
    statusId: string;
  };
}

/** Status to be presented in an iframe for embeds on external websites. */
const EmbeddedStatus: React.FC<IEmbeddedStatus> = ({ params: { statusId: statusId } }) => {
  const history = useHistory();
  const logoSrc = useLogo();

  const statusQuery = useStatus(statusId);

  useEffect(() => {
    // Prevent navigation for UX and security.
    // https://stackoverflow.com/a/71531211
    history.block();
  }, []);

  useEffect(() => {
    window.parent.postMessage({
      type: 'setHeight',
      id: iframeId,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  }, [statusQuery.isSuccess]);

  const logo = logoSrc && (
    <div className='ml-4 flex justify-center align-middle'>
      <SiteLogo className='max-h-[20px] max-w-[112px]' />
    </div>
  );

  const renderInner = () => {
    if (!statusQuery.isSuccess) {
      return <Spinner />;
    } else if (status) {
      return <Status status={statusQuery.data} accountAction={logo || undefined} variant='default' />;
    } else {
      return <MissingIndicator nested />;
    }
  };

  return (
    <a
      className='block bg-white dark:bg-primary-900'
      href={statusQuery.data?.url || '#'}
      onClick={e => e.stopPropagation()}
      target='_blank'
    >
      <div className='pointer-events-none p-4 sm:p-6'>
        {renderInner()}
      </div>
    </a>
  );
};

export { EmbeddedStatus as default };
