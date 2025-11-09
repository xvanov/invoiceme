'use client';

import { useState, useEffect } from 'react';
import { invoiceApi } from '@/lib/api/invoices';
import type { Invoice, CreateInvoiceRequest, AddLineItemRequest } from '@/types/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export function useInvoices(customerId?: string, status?: InvoiceStatus) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    // Check if user is authenticated before making request
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to view invoices');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.list(customerId, status);
      setInvoices(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch invoices';
      setError(errorMessage);
      
      // If 401/403, the API client will handle redirect
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInvoices([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [customerId, status]);

  const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    try {
      const newInvoice = await invoiceApi.create(data);
      await fetchInvoices();
      return newInvoice;
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id: string, data: CreateInvoiceRequest): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await invoiceApi.update(id, data);
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendInvoice = async (id: string): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    try {
      const sent = await invoiceApi.send(id);
      await fetchInvoices();
      return sent;
    } catch (err: any) {
      setError(err.message || 'Failed to send invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (id: string, data: AddLineItemRequest): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await invoiceApi.addLineItem(id, data);
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to add line item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    sendInvoice,
    addLineItem,
    refetch: fetchInvoices,
  };
}

export function useInvoice(id: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getById(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  };
}

