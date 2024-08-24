import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerText } from 'soapbox/actions/compose';
import AutosuggestInput, { IAutosuggestInput } from 'soapbox/components/autosuggest-input';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

const messages = defineMessages({
  placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Subject (optional)' },
});

interface ISpoilerInput extends Pick<IAutosuggestInput, 'onSuggestionsFetchRequested' | 'onSuggestionsClearRequested' | 'onSuggestionSelected'> {
  composeId: string extends 'default' ? never : string;
}

/** Text input for content warning in composer. */
const SpoilerInput = React.forwardRef<AutosuggestInput, ISpoilerInput>(({
  composeId,
  onSuggestionsFetchRequested,
  onSuggestionsClearRequested,
  onSuggestionSelected,
}, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { language, modified_language, spoiler_text: spoilerText, spoilerTextMap, suggestions } = useCompose(composeId);

  const handleChangeSpoilerText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeComposeSpoilerText(composeId, e.target.value));
  };

  const value = !modified_language || modified_language === language ? spoilerText : spoilerTextMap.get(modified_language, '');

  return (
    <AutosuggestInput
      placeholder={intl.formatMessage(messages.placeholder)}
      value={value}
      onChange={handleChangeSpoilerText}
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      searchTokens={[':']}
      id='cw-spoiler-input'
      className='rounded-md !bg-transparent dark:!bg-transparent'
      ref={ref}
    />
  );
});

export { SpoilerInput as default };
