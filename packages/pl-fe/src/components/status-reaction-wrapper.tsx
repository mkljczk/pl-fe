import React, { useState, useEffect, useRef } from 'react';

import { simpleEmojiReact } from 'pl-fe/actions/emoji-reacts';
import { openModal } from 'pl-fe/actions/modals';
import { EmojiSelector, Portal } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector, useOwnAccount } from 'pl-fe/hooks';
import { userTouching } from 'pl-fe/is-mobile';
import { getReactForStatus } from 'pl-fe/utils/emoji-reacts';

interface IStatusReactionWrapper {
  statusId: string;
  children: JSX.Element;
}

/** Provides emoji reaction functionality to the underlying button component */
const StatusReactionWrapper: React.FC<IStatusReactionWrapper> = ({ statusId, children }): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const { account: ownAccount } = useOwnAccount();
  const status = useAppSelector(state => state.statuses.get(statusId));

  const timeout = useRef<NodeJS.Timeout>();
  const [visible, setVisible] = useState(false);

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }, []);

  if (!status) return null;

  const handleMouseEnter = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (!userTouching.matches) {
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    // Unless the user is touching, delay closing the emoji selector briefly
    // so the user can move the mouse diagonally to make a selection.
    if (userTouching.matches) {
      setVisible(false);
    } else {
      timeout.current = setTimeout(() => {
        setVisible(false);
      }, 500);
    }
  };

  const handleReact = (emoji: string, custom?: string): void => {
    if (ownAccount) {
      dispatch(simpleEmojiReact(status, emoji, custom));
    } else {
      handleUnauthorized();
    }

    setVisible(false);
  };

  const handleClick: React.EventHandler<React.MouseEvent> = e => {
    const meEmojiReact = getReactForStatus(status)?.name || '👍';

    if (userTouching.matches) {
      if (ownAccount) {
        if (visible) {
          handleReact(meEmojiReact);
        } else {
          setVisible(true);
        }
      } else {
        handleUnauthorized();
      }
    } else {
      handleReact(meEmojiReact);
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const handleUnauthorized = () => {
    dispatch(openModal('UNAUTHORIZED', {
      action: 'FAVOURITE',
      ap_id: status.url,
    }));
  };

  return (
    <div className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {React.cloneElement(children, {
        onClick: handleClick,
        ref: setReferenceElement,
      })}

      {visible && (
        <Portal>
          <EmojiSelector
            placement='top-start'
            referenceElement={referenceElement}
            onReact={handleReact}
            visible={visible}
            onClose={() => setVisible(false)}
          />
        </Portal>
      )}
    </div>
  );
};

export { StatusReactionWrapper as default };
