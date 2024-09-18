import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Text } from 'pl-fe/components/ui';
import emojify from 'pl-fe/features/emoji';
import { usePlFeConfig } from 'pl-fe/hooks';
import sourceCode from 'pl-fe/utils/code';

const LinkFooter: React.FC = (): JSX.Element => {
  const plFeConfig = usePlFeConfig();

  return (
    <Text theme='muted' size='sm'>
      {plFeConfig.linkFooterMessage ? (
        <span
          className='inline-block align-middle'
          dangerouslySetInnerHTML={{
            __html: emojify(plFeConfig.linkFooterMessage),
          }}
        />
      ) : (
        <FormattedMessage
          id='getting_started.open_source_notice'
          defaultMessage='{code_name} is open source software. You can contribute or report issues at {code_link} (v{code_version}).'
          values={{
            code_name: sourceCode.displayName,
            code_link: (
              <Text theme='subtle' tag='span'>
                <a
                  className='underline'
                  href={sourceCode.url}
                  rel='noopener'
                  target='_blank'
                >
                  {sourceCode.repository}
                </a>
              </Text>
            ),
            code_version: sourceCode.version,
          }}
        />
      )}
    </Text>
  );
};

export { LinkFooter as default };
