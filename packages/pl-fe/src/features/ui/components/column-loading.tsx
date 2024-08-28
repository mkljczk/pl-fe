import React from 'react';

import { Card, CardBody, Spinner } from 'pl-fe/components/ui';

const ColumnLoading = () => (
  <Card variant='rounded'>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export { ColumnLoading as default };
