import type { InvoiceStatus } from '@/types/invoice';

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    DRAFT: 'bg-gray-100 text-gray-700 border border-gray-300',
    SENT: 'bg-primary-100 text-primary-700 border border-primary-300',
    PAID: 'bg-green-100 text-green-700 border border-green-300',
  };

  const statusLabels = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    PAID: 'Paid',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}
      data-testid={`invoice-status-${status.toLowerCase()}`}
    >
      {statusLabels[status]}
    </span>
  );
}

