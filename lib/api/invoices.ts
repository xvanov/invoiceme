import axios, { AxiosError } from 'axios';
import { apiClient } from './client';
import type { Invoice, CreateInvoiceRequest, AddLineItemRequest } from '@/types/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export const invoiceApi = {
  async create(data: CreateInvoiceRequest): Promise<Invoice> {
    try {
      const response = await apiClient.post<Invoice>('/invoices', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        throw axiosError;
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async list(customerId?: string, status?: InvoiceStatus): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const url = queryString ? `/invoices?${queryString}` : '/invoices';
    const response = await apiClient.get<Invoice[]>(url);
    return response.data;
  },

  async update(id: string, data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async send(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/send`, {});
    return response.data;
  },

  async addLineItem(id: string, data: AddLineItemRequest): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/items`, data);
    return response.data;
  },
};

