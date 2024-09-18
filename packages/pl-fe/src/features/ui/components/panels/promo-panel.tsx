import React from 'react';

import ForkAwesomeIcon from 'pl-fe/components/fork-awesome-icon';
import List, { ListItem } from 'pl-fe/components/list';
import { HStack, Widget } from 'pl-fe/components/ui';
import { useInstance, usePlFeConfig, useSettings } from 'pl-fe/hooks';

const PromoPanel: React.FC = () => {
  const instance = useInstance();
  const { promoPanel } = usePlFeConfig();
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
                <ForkAwesomeIcon
                  id={item.icon}
                  className='flex-none text-lg'
                  fixedWidth
                />
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
