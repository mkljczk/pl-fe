import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createRemarkExport } from '@mkljczk/lexical-remark';
import { $getRoot } from 'lexical';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';

import { addSuggestedQuote, setEditorState } from 'soapbox/actions/compose';
import { fetchStatus } from 'soapbox/actions/statuses';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';
import { getStatusIdsFromLinksInContent } from 'soapbox/utils/status';

interface IStatePlugin {
  composeId: string;
  isWysiwyg?: boolean;
}

const StatePlugin: React.FC<IStatePlugin> = ({ composeId, isWysiwyg }) => {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();
  const features = useFeatures();

  const getQuoteSuggestions = useCallback(debounce((text: string) => {
    dispatch(async (_, getState) => {
      const state = getState();
      const compose = state.compose.get(composeId);

      if (!features.quotePosts || compose?.quote) return;

      const ids = getStatusIdsFromLinksInContent(text);

      let quoteId: string | undefined;

      for (const id of ids) {
        if (compose?.dismissed_quotes.includes(id)) continue;

        if (state.statuses.get(id)) {
          quoteId = id;
          break;
        }

        const status = await dispatch(fetchStatus(id));

        if (status) {
          quoteId = status.id;
          break;
        }
      }

      if (quoteId) dispatch(addSuggestedQuote(composeId, quoteId));
    });
  }, 2000), []);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      let text;
      if (isWysiwyg) {
        text = editorState.read($createRemarkExport({
          handlers: {
            hashtag: (node) => ({ type: 'text', value: node.getTextContent() }),
            mention: (node) => ({ type: 'text', value: node.getTextContent() }),
          },
        }));
      } else {
        text = editorState.read(() => $getRoot().getTextContent());
      }
      const isEmpty = text === '';
      const data = isEmpty ? null : JSON.stringify(editorState.toJSON());
      dispatch(setEditorState(composeId, data, text));
      getQuoteSuggestions(text);
    });
  }, [editor]);

  return null;
};

export { StatePlugin as default };
