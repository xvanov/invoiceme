'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import type { Customer } from '@/types/customer';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, loading, error } = useCustomers();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = searchParams.get('success');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  const handleCreateClick = () => {
    router.push('/customers/new');
  };

  const handleCustomerClick = (id: string) => {
    router.push(`/customers/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading customers</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-gray-600">Manage your customer database</p>
          </div>
          <Button 
            onClick={handleCreateClick} 
            data-testid="create-customer-button"
            size="lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Customer
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

      <div className="animate-fade-in">
        <Table
          columns={[
            { 
              key: 'name', 
              header: 'Name', 
              render: (customer) => (
                <span className="font-semibold text-gray-900">{customer.name}</span>
              )
            },
            { 
              key: 'email', 
              header: 'Email', 
              render: (customer) => (
                <span className="text-gray-600">{customer.email}</span>
              )
            },
          ]}
          data={customers}
          onRowClick={(customer) => handleCustomerClick(customer.id)}
          testId="customers-table"
          rowTestId={(customer) => `customer-row-${customer.id}`}
        />
      </div>
    </div>
  );
}
