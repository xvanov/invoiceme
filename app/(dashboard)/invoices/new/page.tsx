'use client';

import { useRouter } from 'next/navigation';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { InvoiceForm } from '@/components/forms/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();
  const { createInvoice } = useInvoices();

  const handleSubmit = async (data: { customerId: string }) => {
    try {
      const newInvoice = await createInvoice(data);
      // Redirect to invoice detail page where user can add line items
      router.push(`/invoices/${newInvoice.id}?success=${encodeURIComponent('Invoice created successfully')}`);
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      // Show error message to user
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to create invoice. Please check the console for details.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
        <p className="text-gray-600">Create a new invoice for a customer</p>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-8 animate-fade-in">
        <InvoiceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

