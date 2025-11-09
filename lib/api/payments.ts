import axios, { AxiosError } from 'axios';
import { apiClient } from './client';
import type { Payment, RecordPaymentRequest } from '@/types/payment';

export const paymentApi = {
  async record(data: RecordPaymentRequest): Promise<Payment> {
    try {
      // Format paymentDate to ISO string without timezone (LocalDateTime format)
      // Convert "2025-11-09T17:21:00.000Z" to "2025-11-09T17:21:00"
      let formattedDate = data.paymentDate;
      if (formattedDate.includes('Z')) {
        formattedDate = formattedDate.replace('Z', '');
      }
      if (formattedDate.includes('.')) {
        formattedDate = formattedDate.split('.')[0];
      }
      
      const payload = {
        ...data,
        paymentDate: formattedDate,
      };
      const response = await apiClient.post<Payment>('/payments', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        // Log the actual error response for debugging
        if (axiosError.response?.data) {
          console.error('Payment API error:', axiosError.response.data);
        }
        throw axiosError;
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  async listByInvoice(invoiceId: string): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(`/payments/invoice/${invoiceId}`);
    return response.data;
  },
};

