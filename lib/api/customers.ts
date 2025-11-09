import axios, { AxiosError } from 'axios';
import { apiClient } from './client';
import type { Customer, CreateCustomerRequest } from '@/types/customer';

export const customerApi = {
  async create(data: CreateCustomerRequest): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>('/customers', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        // Re-throw with response data for error handling
        throw axiosError;
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async list(): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>('/customers');
    return response.data;
  },

  async update(id: string, data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};


