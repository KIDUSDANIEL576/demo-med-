
import React from 'react';

interface DataTableProps<T> {
  // FIX: Changed `key` type from `keyof T | 'actions'` to `string` to simplify the component's props
  // and resolve issues with TypeScript's generic type inference in consuming components.
  columns: { key: string; header: string }[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

const DataTable = <T extends { id: any }>(
  { columns, data, renderRow }: DataTableProps<T>
) => {
  // Safety check for columns and data
  if (!columns || !Array.isArray(columns)) {
      return <div className="p-4 text-slate-500 italic">Table configuration error: No columns defined.</div>;
  }

  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-base-300 shadow-md rounded-lg overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-base-200">
          <thead className="bg-base-200/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-base-300 divide-y divide-base-200">
            {safeData.length > 0 ? (
                safeData.map(renderRow)
            ) : (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-4 text-center text-slate-500">
                        No data available.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
