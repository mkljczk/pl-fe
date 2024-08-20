import React from 'react';

import Text, { IText } from './ui/text/text';

interface IMarkup extends IText {
}

/** Styles HTML markup returned by the API, such as in account bios and statuses. */
const Markup = React.forwardRef<any, IMarkup>((props, ref) => <Text ref={ref} {...props} data-markup />);

export { Markup as default };
