'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useInvoice } from '@/lib/hooks/useInvoices';
import { usePayments } from '@/lib/hooks/usePayments';
import { invoiceApi } from '@/lib/api/invoices';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LineItemManager } from '@/components/forms/LineItemManager';
import type { AddLineItemRequest } from '@/types/invoice';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { invoice, loading, error, refetch } = useInvoice(id);
  const { payments, loading: paymentsLoading } = usePayments(id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendInvoice = async () => {
    if (!invoice) return;
    try {
      setErrorMessage(null);
      await invoiceApi.send(invoice.id);
      await refetch();
      router.push('/invoices?success=' + encodeURIComponent('Invoice sent successfully'));
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to send invoice. Please try again.';
      setErrorMessage(errorMsg);
      console.error('Failed to send invoice:', error);
    }
  };

  const handleAddLineItem = async (data: AddLineItemRequest) => {
    if (!invoice) return;
    try {
      setErrorMessage(null);
      await invoiceApi.addLineItem(invoice.id, data);
      await refetch();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to add line item. Please try again.';
      setErrorMessage(errorMsg);
      console.error('Failed to add line item:', error);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const canEdit = invoice.status === 'DRAFT';
  const canSend = invoice.status === 'DRAFT' && invoice.lineItems.length > 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Invoice Details</h1>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="invoice-error-message">
          {errorMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="invoice-error-message">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Invoice ID:</strong> {invoice.id.substring(0, 8)}
          </div>
          <div>
            <strong>Status:</strong> <StatusBadge status={invoice.status} />
          </div>
          <div>
            <strong>Balance:</strong> ${invoice.balance.toFixed(2)}
          </div>
          {invoice.createdAt && (
            <div>
              <strong>Created:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <LineItemManager
          lineItems={invoice.lineItems}
          onAdd={handleAddLineItem}
          readOnly={!canEdit}
        />
      </div>

      {payments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ${payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {canSend && (
          <Button onClick={handleSendInvoice} data-testid="send-invoice-button">
            Send Invoice
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => router.push('/invoices')}
        >
          Back to Invoices
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(`/payments/new?invoiceId=${invoice.id}`)}
          data-testid="record-payment-button"
        >
          Record Payment
        </Button>
      </div>
    </div>
  );
}


