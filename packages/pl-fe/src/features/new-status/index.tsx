import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { useModalsStore } from 'pl-fe/stores';

const NewStatus = () => {
  const { openModal } = useModalsStore();

  useEffect(() => {
    openModal('COMPOSE');
  }, []);

  return (
    <Redirect to='/' />
  );
};

export { NewStatus as default };
