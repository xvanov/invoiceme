'use client';

import { useRouter } from 'next/navigation';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { CustomerForm } from '@/components/forms/CustomerForm';

export default function NewCustomerPage() {
  const router = useRouter();
  const { createCustomer } = useCustomers();

  const handleSubmit = async (data: { name: string; email: string }) => {
    try {
      await createCustomer(data);
      router.push('/customers?success=' + encodeURIComponent('Customer created successfully'));
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Customer</h1>
        <p className="text-gray-600">Add a new customer to your database</p>
      </div>
      <div className="bg-white rounded-xl shadow-soft p-8 animate-fade-in">
        <CustomerForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}


