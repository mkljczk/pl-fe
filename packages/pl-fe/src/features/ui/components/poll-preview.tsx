import noop from 'lodash/noop';
import React from 'react';

import PollOption from 'soapbox/components/polls/poll-option';
import { Stack } from 'soapbox/components/ui';

import type { Poll } from 'soapbox/normalizers/poll';

interface IPollPreview {
  poll: Poll;
}

const PollPreview: React.FC<IPollPreview> = ({ poll }) => {
  if (typeof poll !== 'object') {
    return null;
  }

  return (
    <Stack space={2}>
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          poll={poll}
          option={option}
          index={i}
          showResults={false}
          active={false}
          onToggle={noop}
        />
      ))}
    </Stack>
  );
};

export { PollPreview as default };
