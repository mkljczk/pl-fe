import DOMPurify from 'isomorphic-dompurify';
import React, { useMemo } from 'react';

import Markup from 'pl-fe/components/markup';
import Stack from 'pl-fe/components/ui/stack';
import { useInstance } from 'pl-fe/hooks/useInstance';
import { getTextDirection } from 'pl-fe/utils/rtl';

import { LogoText } from './logo-text';

const SiteBanner: React.FC = () => {
  const instance = useInstance();
  const description = useMemo(() => DOMPurify.sanitize(instance.description), [instance.description]);

  return (
    <Stack space={6}>
      <LogoText dir={getTextDirection(instance.title)}>
        {instance.title}
      </LogoText>

      {instance.description.trim().length > 0 && (
        <Markup
          size='lg'
          dangerouslySetInnerHTML={{ __html: description }}
          direction={getTextDirection(description)}
        />
      )}
    </Stack>
  );
};

export { SiteBanner };
