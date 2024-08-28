import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Text } from 'soapbox/components/ui';
import emojify from 'soapbox/features/emoji';
import { useSoapboxConfig } from 'soapbox/hooks';
import sourceCode from 'soapbox/utils/code';

const LinkFooter: React.FC = (): JSX.Element => {
  const soapboxConfig = useSoapboxConfig();

  return (
    <Text theme='muted' size='sm'>
      {soapboxConfig.linkFooterMessage ? (
        <span
          className='inline-block align-middle'
          dangerouslySetInnerHTML={{ __html: emojify(soapboxConfig.linkFooterMessage) }}
        />
      ) : (
        <FormattedMessage
          id='getting_started.open_source_notice'
          defaultMessage='{code_name} is open source software. You can contribute or report issues at {code_link} (v{code_version}).'
          values={{
            code_name: sourceCode.displayName,
            code_link: <Text theme='subtle' tag='span'><a className='underline' href={sourceCode.url} rel='noopener' target='_blank'>{sourceCode.repository}</a></Text>,
            code_version: sourceCode.version,
          }}
        />
      )}
    </Text>
  );
};

export { LinkFooter as default };
