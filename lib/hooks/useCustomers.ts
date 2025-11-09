'use client';

import { useState, useEffect } from 'react';
import { customerApi } from '@/lib/api/customers';
import type { Customer, CreateCustomerRequest } from '@/types/customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    // Check if user is authenticated before making request
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to view customers');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.list();
      setCustomers(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch customers';
      setError(errorMessage);
      
      // If 401/403, the API client will handle redirect
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Clear local state
        setCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (data: CreateCustomerRequest): Promise<Customer> => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await customerApi.create(data);
      await fetchCustomers();
      return newCustomer;
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, data: CreateCustomerRequest): Promise<Customer> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await customerApi.update(id, data);
      await fetchCustomers();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.delete(id);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}


