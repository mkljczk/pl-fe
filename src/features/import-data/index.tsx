import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  importFollows,
  importBlocks,
  importMutes,
} from 'soapbox/actions/import-data';
import { Column } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';

import DataImporter from './components/data-importer';

const messages = defineMessages({
  heading: { id: 'column.import_data', defaultMessage: 'Import data' },
  submit: { id: 'import_data.actions.import', defaultMessage: 'Import' },
});

const followMessages = defineMessages({
  input_label: { id: 'import_data.follows_label', defaultMessage: 'Follows' },
  input_hint: { id: 'import_data.hints.follows', defaultMessage: 'CSV file containing a list of followed accounts' },
  submit: { id: 'import_data.actions.import_follows', defaultMessage: 'Import follows' },
});

const blockMessages = defineMessages({
  input_label: { id: 'import_data.blocks_label', defaultMessage: 'Blocks' },
  input_hint: { id: 'import_data.hints.blocks', defaultMessage: 'CSV file containing a list of blocked accounts' },
  submit: { id: 'import_data.actions.import_blocks', defaultMessage: 'Import blocks' },
});

const muteMessages = defineMessages({
  input_label: { id: 'import_data.mutes_label', defaultMessage: 'Mutes' },
  input_hint: { id: 'import_data.hints.mutes', defaultMessage: 'CSV file containing a list of muted accounts' },
  submit: { id: 'import_data.actions.import_mutes', defaultMessage: 'Import mutes' },
});

const ImportData = () => {
  const intl = useIntl();
  const features = useFeatures();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {features.importFollows && <DataImporter action={importFollows} messages={followMessages} allowOverwrite />}
      {features.importBlocks && <DataImporter action={importBlocks} messages={blockMessages} allowOverwrite />}
      {features.importMutes && <DataImporter action={importMutes} messages={muteMessages} />}
    </Column>
  );
};

export { ImportData as default };
