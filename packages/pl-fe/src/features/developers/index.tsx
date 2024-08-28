import React from 'react';

import { getSettings } from 'pl-fe/actions/settings';
import { useAppSelector } from 'pl-fe/hooks';

import DevelopersChallenge from './developers-challenge';
import DevelopersMenu from './developers-menu';

const Developers: React.FC = () => {
  const isDeveloper = useAppSelector((state) => getSettings(state).get('isDeveloper'));

  return isDeveloper ? <DevelopersMenu /> : <DevelopersChallenge />;
};

export { Developers as default };
