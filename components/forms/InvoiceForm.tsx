'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validation/invoiceSchema';
import { useCustomers } from '@/lib/hooks/useCustomers';
import type { Invoice } from '@/types/invoice';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: { customerId: string }) => Promise<void>;
  onCancel?: () => void;
}

export function InvoiceForm({ invoice, onSubmit, onCancel }: InvoiceFormProps) {
  const { customers, loading: customersLoading } = useCustomers();
  const [customerId, setCustomerId] = useState(invoice?.customerId || '');
  const [errors, setErrors] = useState<{ customerId?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId);
    }
  }, [invoice]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      createInvoiceSchema.parse({ customerId });
      setSubmitting(true);
      await onSubmit({ customerId });
    } catch (err: any) {
      if (err.name === 'ZodError' && err.issues) {
        const formErrors: { customerId?: string } = {};
        err.issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0 && issue.path[0] === 'customerId') {
            formErrors.customerId = issue.message;
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Customer
        </label>
        <select
          name="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className={`w-full px-3 py-2 border rounded ${errors.customerId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={customersLoading || !!invoice}
          data-testid="invoice-customer-select"
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
        {errors.customerId && (
          <div className="mt-1 text-sm text-red-600" data-testid="invoice-customer-error">
            {errors.customerId}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || customersLoading} data-testid="save-invoice-button">
          Save
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

