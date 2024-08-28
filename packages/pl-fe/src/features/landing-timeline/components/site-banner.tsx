import DOMPurify from 'isomorphic-dompurify';
import React from 'react';

import Markup from 'pl-fe/components/markup';
import { Stack } from 'pl-fe/components/ui';
import { useInstance } from 'pl-fe/hooks';
import { getTextDirection } from 'pl-fe/utils/rtl';

import { LogoText } from './logo-text';

const SiteBanner: React.FC = () => {
  const instance = useInstance();
  const description = DOMPurify.sanitize(instance.description);

  return (
    <Stack space={3}>
      <LogoText dir={getTextDirection(instance.title)}>
        {instance.title}
      </LogoText>

      <Markup
        size='lg'
        dangerouslySetInnerHTML={{ __html: description }}
        direction={getTextDirection(description)}
      />
    </Stack>
  );
};

export { SiteBanner };
