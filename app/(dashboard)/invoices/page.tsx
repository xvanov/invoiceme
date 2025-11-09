'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Invoice } from '@/types/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(
    (searchParams.get('status') as InvoiceStatus) || undefined
  );
  const [customerFilter, setCustomerFilter] = useState<string | undefined>(
    searchParams.get('customerId') || undefined
  );
  const { invoices, loading, error } = useInvoices(customerFilter, statusFilter);
  const { customers } = useCustomers();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = searchParams.get('success');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  const handleCreateClick = () => {
    router.push('/invoices/new');
  };

  const handleInvoiceClick = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value ? (value as InvoiceStatus) : undefined);
  };

  const handleCustomerFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCustomerFilter(value || undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading invoices</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-gray-600">Manage and track your invoices</p>
          </div>
          <Button 
            onClick={handleCreateClick} 
            data-testid="create-invoice-button"
            size="lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Invoice
            </span>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div 
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-slide-up shadow-soft" 
          data-testid="success-message"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      <div className="mb-6 bg-white rounded-xl shadow-soft p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter || ''}
              onChange={handleStatusFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              data-testid="invoice-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Customer</label>
            <select
              value={customerFilter || ''}
              onChange={handleCustomerFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              data-testid="invoice-customer-filter"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="animate-fade-in">
        <Table
          columns={[
            {
              key: 'id',
              header: 'Invoice ID',
              render: (invoice) => (
                <span className="font-mono text-sm text-gray-600">{invoice.id.substring(0, 8)}</span>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              render: (invoice) => {
                const customer = customers.find((c) => c.id === invoice.customerId);
                return (
                  <span className="font-semibold text-gray-900">
                    {customer ? customer.name : invoice.customerId.substring(0, 8)}
                  </span>
                );
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (invoice) => <StatusBadge status={invoice.status} />,
            },
            {
              key: 'balance',
              header: 'Balance',
              render: (invoice) => (
                <span className="font-semibold text-gray-900">
                  ${invoice.balance.toFixed(2)}
                </span>
              ),
            },
          ]}
          data={invoices}
          onRowClick={(invoice) => handleInvoiceClick(invoice.id)}
          testId="invoices-table"
          rowTestId={(invoice) => `invoice-row-${invoice.id}`}
        />
      </div>
    </div>
  );
}

