'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { customerApi } from '@/lib/api/customers';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { Button } from '@/components/ui/Button';
import type { Customer } from '@/types/customer';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateCustomer, deleteCustomer } = useCustomers();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setError(null);
        const data = await customerApi.getById(id);
        setCustomer(data);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load customer. Please try again.';
        setError(errorMessage);
        console.error('Failed to fetch customer:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUpdate = async (data: { name: string; email: string }) => {
    try {
      setError(null);
      const updated = await updateCustomer(id, data);
      setCustomer(updated);
      setEditing(false);
      // Refetch customer to ensure we have latest data
      const refreshed = await customerApi.getById(id);
      setCustomer(refreshed);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update customer. Please try again.';
      setError(errorMessage);
      console.error('Failed to update customer:', error);
      throw error; // Re-throw so form can handle it
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        setError(null);
        await deleteCustomer(id);
        router.push('/customers');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete customer. Please try again.';
        setError(errorMessage);
        console.error('Failed to delete customer:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  if (editing) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="customer-error-message">
            {error}
          </div>
        )}
        <CustomerForm
          customer={customer}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditing(false);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Details</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="customer-error-message">
          {error}
        </div>
      )}
      <div className="mb-4">
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleEdit} data-testid="edit-customer-button">
          Edit
        </Button>
        <Button onClick={handleDelete} variant="danger" data-testid="delete-customer-button">
          Delete
        </Button>
      </div>
    </div>
  );
}


