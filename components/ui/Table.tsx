import React from 'react';

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  testId?: string;
  rowTestId?: (item: T, index: number) => string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  testId = 'table',
  rowTestId,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-12 text-center">
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table
          className="w-full"
          data-testid={testId}
        >
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  data-testid={`customer-${column.key}-column`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`
                  transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-primary-50 active:bg-primary-100' : 'hover:bg-gray-50'}
                `}
                data-testid={rowTestId ? rowTestId(item, index) : `${testId}-row-${item.id}`}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    data-testid={`${testId}-${column.key}-cell`}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

