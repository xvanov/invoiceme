'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePayments } from '@/lib/hooks/usePayments';
import { useInvoice } from '@/lib/hooks/useInvoices';
import { PaymentForm } from '@/components/forms/PaymentForm';

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const { invoice } = useInvoice(invoiceId || null);
  const { recordPayment } = usePayments(invoiceId || undefined);

  const handleSubmit = async (data: { invoiceId: string; amount: number; paymentDate: string }) => {
    try {
      await recordPayment(data);
      router.push('/payments?success=' + encodeURIComponent('Payment recorded successfully'));
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      // Show validation errors if available
      if (error.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        const errorMessages = validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
        alert(`Validation errors: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to record payment. Please check the console for details.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Record Payment</h1>
        <p className="text-gray-600">Record a payment for an invoice</p>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-8 animate-fade-in">
        <PaymentForm
          invoiceId={invoiceId || undefined}
          invoice={invoice || undefined}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

