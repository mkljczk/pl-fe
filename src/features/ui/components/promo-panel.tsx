import React from 'react';

import ForkAwesomeIcon from 'soapbox/components/fork-awesome-icon';
import List, { ListItem } from 'soapbox/components/list';
import { Widget, HStack } from 'soapbox/components/ui';
import { useInstance, useSettings, useSoapboxConfig } from 'soapbox/hooks';

const PromoPanel: React.FC = () => {
  const instance = useInstance();
  const { promoPanel } = useSoapboxConfig();
  const { locale } = useSettings();

  const promoItems = promoPanel.get('items');

  if (!promoItems || promoItems.isEmpty()) return null;

  return (
    <Widget title={instance.title}>
      <List>
        {promoItems.map((item, i) => (
          <ListItem
            key={i}
            href={item.url}
            label={
              <HStack alignItems='center' space={2}>
                <ForkAwesomeIcon id={item.icon} className='flex-none text-lg' fixedWidth />
                <span>{item.textLocales.get(locale) || item.text}</span>
              </HStack>
            }
            size='sm'
          />
        ))}
      </List>
    </Widget>
  );
};

export { PromoPanel as default };
