'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { recordPaymentSchema, type RecordPaymentFormData } from '@/lib/validation/paymentSchema';
import { useInvoices } from '@/lib/hooks/useInvoices';
import type { Invoice } from '@/types/invoice';

interface PaymentFormProps {
  invoiceId?: string;
  invoice?: Invoice;
  onSubmit: (data: { invoiceId: string; amount: number; paymentDate: string }) => Promise<void>;
  onCancel?: () => void;
}

export function PaymentForm({ invoiceId, invoice, onSubmit, onCancel }: PaymentFormProps) {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoiceId || invoice?.id || '');
  const [amount, setAmount] = useState(invoice ? invoice.balance.toString() : '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ invoiceId?: string; amount?: string; paymentDate?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setSelectedInvoiceId(invoice.id);
      setAmount(invoice.balance.toString());
    }
  }, [invoice]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = recordPaymentSchema.parse({
        invoiceId: selectedInvoiceId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate).toISOString(),
      });
      setSubmitting(true);
      await onSubmit(data);
    } catch (err: any) {
      if (err.name === 'ZodError' && err.issues) {
        const formErrors: { invoiceId?: string; amount?: string; paymentDate?: string } = {};
        err.issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            const field = issue.path[0];
            if (field === 'invoiceId') {
              formErrors.invoiceId = issue.message;
            } else if (field === 'amount') {
              formErrors.amount = issue.message;
            } else if (field === 'paymentDate') {
              formErrors.paymentDate = issue.message;
            }
          }
        });
        setErrors(formErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {!invoiceId && !invoice && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Invoice
          </label>
          <select
            name="invoiceId"
            value={selectedInvoiceId}
            onChange={(e) => {
              setSelectedInvoiceId(e.target.value);
              const selectedInvoice = invoices.find((inv) => inv.id === e.target.value);
              if (selectedInvoice) {
                setAmount(selectedInvoice.balance.toString());
              }
            }}
            className={`w-full px-3 py-2 border rounded ${errors.invoiceId ? 'border-red-500' : 'border-gray-300'}`}
            disabled={invoicesLoading}
            data-testid="payment-invoice-select"
          >
            <option value="">Select an invoice</option>
            {invoices
              .filter((inv) => inv.status === 'SENT')
              .map((inv) => (
                <option key={inv.id} value={inv.id}>
                  Invoice #{inv.id.substring(0, 8)} - ${inv.balance.toFixed(2)} ({inv.status})
                </option>
              ))}
          </select>
          {errors.invoiceId && (
            <div className="mt-1 text-sm text-red-600" data-testid="payment-invoice-error">
              {errors.invoiceId}
            </div>
          )}
        </div>
      )}
      <Input
        label="Amount"
        name="amount"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!!invoiceId || !!invoice}
        data-testid="payment-amount-input"
        error={errors.amount}
      />
      <Input
        label="Payment Date"
        name="paymentDate"
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
        data-testid="payment-date-input"
        error={errors.paymentDate}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || invoicesLoading} data-testid="save-payment-button">
          Record Payment
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

