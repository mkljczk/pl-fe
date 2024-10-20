import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  exportFollows,
  exportBlocks,
  exportMutes,
} from 'pl-fe/actions/export-data';
import Column from 'pl-fe/components/ui/column';

import CSVExporter from './components/csv-exporter';

const messages = defineMessages({
  heading: { id: 'column.export_data', defaultMessage: 'Export data' },
  submit: { id: 'export_data.actions.export', defaultMessage: 'Export' },
});

const followMessages = defineMessages({
  input_label: { id: 'export_data.follows_label', defaultMessage: 'Follows' },
  input_hint: { id: 'export_data.hints.follows', defaultMessage: 'Get a CSV file containing a list of followed accounts' },
  submit: { id: 'export_data.actions.export_follows', defaultMessage: 'Export follows' },
});

const blockMessages = defineMessages({
  input_label: { id: 'export_data.blocks_label', defaultMessage: 'Blocks' },
  input_hint: { id: 'export_data.hints.blocks', defaultMessage: 'Get a CSV file containing a list of blocked accounts' },
  submit: { id: 'export_data.actions.export_blocks', defaultMessage: 'Export blocks' },
});

const muteMessages = defineMessages({
  input_label: { id: 'export_data.mutes_label', defaultMessage: 'Mutes' },
  input_hint: { id: 'export_data.hints.mutes', defaultMessage: 'Get a CSV file containing a list of muted accounts' },
  submit: { id: 'export_data.actions.export_mutes', defaultMessage: 'Export mutes' },
});

const ExportData = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <CSVExporter action={exportFollows} messages={followMessages} />
      <CSVExporter action={exportBlocks} messages={blockMessages} />
      <CSVExporter action={exportMutes} messages={muteMessages} />
    </Column>
  );
};

export { ExportData as default };
