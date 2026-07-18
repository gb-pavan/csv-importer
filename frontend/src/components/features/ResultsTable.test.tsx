import { render, screen } from '@testing-library/react';
import { ResultsTable } from './ResultsTable';

it('formats Created At values in 12-hour local time', () => {
  render(
    <ResultsTable
      totalImported={1}
      totalSkipped={0}
      batchesProcessed={1}
      parsedLeads={[{ created_at: '2026-07-18T12:22:00', name: 'Jane Doe', email: 'jane@example.com' }]}
      skippedRecords={[]}
    />,
  );

  expect(screen.getByText('18-07-2026 12:22 PM')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'created at' }).closest('thead')).toHaveClass('bg-slate-950');
});

it('keeps the skipped-record header opaque', () => {
  render(
    <ResultsTable
      totalImported={0}
      totalSkipped={1}
      batchesProcessed={1}
      parsedLeads={[]}
      skippedRecords={[{ sourceRow: 2, reason: 'Missing contact details', created_at: '2026-07-18T00:05:00' }]}
    />,
  );

  expect(screen.getByText('18-07-2026 12:05 AM')).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')[0].closest('thead')).toHaveClass('bg-slate-950');
});
