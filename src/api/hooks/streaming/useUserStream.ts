import { expandNotifications } from 'soapbox/actions/notifications';
import { expandHomeTimeline } from 'soapbox/actions/timelines';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useLoggedIn } from 'soapbox/hooks';

import { useTimelineStream } from './useTimelineStream';

import type { IntlShape } from 'react-intl';
import type { AppDispatch } from 'soapbox/store';

const useUserStream = () => {
  const { isLoggedIn } = useLoggedIn();
  const statContext = useStatContext();

  return useTimelineStream(
    'home',
    'user',
    refresh,
    null,
    { statContext, enabled: isLoggedIn },
  );
};

/** Refresh home timeline and notifications. */
const refresh = (dispatch: AppDispatch, intl?: IntlShape, done?: () => void) =>
  dispatch(expandHomeTimeline({}, intl, () => dispatch(expandNotifications({}, done))));

export { useUserStream };