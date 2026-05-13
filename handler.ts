import type { StartTaskMessage, TaskContext, HandlerResult } from '@blocks-network/sdk';

  function toCSV(data: unknown): string {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const rows = data as unknown[];

    if (rows.length === 0) {
      return '';
    }

    const firstRow = rows[0];

    if (Array.isArray(firstRow)) {
      return rows
        .map((row) =>
          (row as unknown[])
            .map((cell) => {
              const val = typeof cell === 'object' ? JSON.stringify(cell) : String(cell ?? '');
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(','),
        )
        .join('\n');
    }

    if (typeof firstRow === 'object' && firstRow !== null) {
      const allKeys = Array.from(
        rows.reduce((acc, row) => {
          if (typeof row === 'object' && row !== null) {
            Object.keys(row as Record<string, unknown>).forEach((k) => acc.add(k));
          }
          return acc;
        }, new Set<string>()),
      );

      const escape = (val: unknown): string => {
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      };

      const header = allKeys.map((k) => escape(k)).join(',');
      const body = rows.map((row) => {
        const obj = row as Record<string, unknown>;
        return allKeys.map((k) => escape(obj[k])).join(',');
      });

      return [header, ...body].join('\n');
    }

    return rows.map((r) => `"${String(r ?? '').replace(/"/g, '""')}"`).join('\n');
  }

  export default async function handler(
    task: StartTaskMessage,
    ctx?: TaskContext,
  ): Promise<HandlerResult> {
    ctx?.reportStatus('Parsing JSON input...');

    const part = task.requestParts?.[0];
    const rawText: string =
      typeof part === 'string' ? part : ((part as Record<string, unknown>)?.text as string) ?? '';

    if (!rawText.trim()) {
      return {
        artifacts: [{ data: 'Error: No JSON input provided.', mimeType: 'text/plain' }],
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch (err) {
      return {
        artifacts: [
          {
            data: `Error: Invalid JSON — ${(err as Error).message}`,
            mimeType: 'text/plain',
          },
        ],
      };
    }

    ctx?.reportStatus('Converting to CSV...');

    try {
      const csv = toCSV(parsed);
      return {
        artifacts: [{ data: csv, mimeType: 'text/csv', fileName: 'output.csv' }],
      };
    } catch (err) {
      return {
        artifacts: [
          {
            data: `Error: Could not convert to CSV — ${(err as Error).message}`,
            mimeType: 'text/plain',
          },
        ],
      };
    }
  }
  