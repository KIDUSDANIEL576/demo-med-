
import React from 'react';
import { motion } from 'motion/react';

interface DataTableProps<T> {
  columns: { key: string; header: string }[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

const DataTable = <T extends { id: any }>(
  { columns, data, renderRow }: DataTableProps<T>
) => {
  if (!columns || !Array.isArray(columns)) {
      return <div className="p-8 text-slate-400 italic font-medium text-center bg-slate-50 rounded-[2rem]">Table configuration error: No columns defined.</div>;
  }

  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white shadow-sm rounded-[2.5rem] border border-slate-100 overflow-hidden relative">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full divide-y divide-slate-50">
          <thead className="bg-slate-50/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {safeData.length > 0 ? (
                safeData.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* The actual row content is rendered by the parent via renderRow */}
                    {/* We wrap it in a fragment to ensure it's valid JSX */}
                    {renderRow(item)}
                  </motion.tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="px-8 py-20 text-center">
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No records found</p>
                          <p className="text-xs text-slate-300">Try adjusting your filters or search query</p>
                        </div>
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

