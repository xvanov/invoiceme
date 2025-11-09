'use client';

import { useState, useEffect } from 'react';
import { paymentApi } from '@/lib/api/payments';
import type { Payment, RecordPaymentRequest } from '@/types/payment';

export function usePayments(invoiceId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!invoiceId) return;
    
    // Check if user is authenticated before making request
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to view payments');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.listByInvoice(invoiceId);
      setPayments(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch payments';
      setError(errorMessage);
      
      // If 401/403, the API client will handle redirect
      if (err.response?.status === 401 || err.response?.status === 403) {
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [invoiceId]);

  const recordPayment = async (data: RecordPaymentRequest): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      const newPayment = await paymentApi.record(data);
      await fetchPayments();
      return newPayment;
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    loading,
    error,
    recordPayment,
    refetch: fetchPayments,
  };
}

