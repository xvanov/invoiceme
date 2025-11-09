'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { paymentApi } from '@/lib/api/payments';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import type { Invoice } from '@/types/invoice';

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invoices, loading, error } = useInvoices();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Array<{ id: string; invoiceId: string; amount: number; paymentDate: string; invoice?: Invoice }>>([]);

  useEffect(() => {
    const message = searchParams.get('success');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAllPayments = async () => {
      if (invoices.length === 0) return;
      
      const paymentsPromises = invoices.map(async (invoice) => {
        try {
          const payments = await paymentApi.listByInvoice(invoice.id);
          return payments.map((payment) => ({
            ...payment,
            invoice,
          }));
        } catch (err) {
          // Silently ignore errors for individual invoices
          return [];
        }
      });

      const paymentsArrays = await Promise.all(paymentsPromises);
      const flatPayments = paymentsArrays.flat();
      setAllPayments(flatPayments);
    };

    if (invoices.length > 0) {
      fetchAllPayments();
    }
  }, [invoices]);

  const handleCreateClick = () => {
    router.push('/payments/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading payments</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="mt-2 text-gray-600">Track and manage payment records</p>
          </div>
          <Button 
            onClick={handleCreateClick} 
            data-testid="record-payment-button"
            size="lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record Payment
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

      {allPayments.length > 0 ? (
        <div className="animate-fade-in">
          <Table
            columns={[
              {
                key: 'invoiceId',
                header: 'Invoice ID',
                render: (payment) => (
                  <span className="font-mono text-sm text-gray-600">{payment.invoiceId.substring(0, 8)}</span>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (payment) => (
                  <span className="font-semibold text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </span>
                ),
              },
              {
                key: 'paymentDate',
                header: 'Payment Date',
                render: (payment) => (
                  <span className="text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                ),
              },
            ]}
            data={allPayments}
            testId="payments-table"
            rowTestId={(payment) => `payment-row-${payment.id}`}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center animate-fade-in">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No payments recorded yet</p>
          <p className="text-gray-400 text-sm mt-2">Record your first payment to get started</p>
        </div>
      )}
    </div>
  );
}

