import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { openModal } from 'pl-fe/actions/modals';
import { useAppDispatch } from 'pl-fe/hooks';

const NewStatus = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openModal('COMPOSE'));
  }, []);

  return (
    <Redirect to='/' />
  );
};

export { NewStatus as default };
