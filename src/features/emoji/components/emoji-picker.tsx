import { Picker as EmojiPicker } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

import { joinPublicPath } from 'soapbox/utils/static';

import data from '../data';

const getSpritesheetURL = (set: string) => require('emoji-datasource/img/twitter/sheets/32.png');

const getImageURL = (set: string, name: string) => joinPublicPath(`/packs/emoji/${name}.svg`);

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref, getImageURL, getSpritesheetURL };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
};

export default Picker;
